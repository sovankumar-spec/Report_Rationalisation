/**
 * formatAdapters.ts — Multi-format BI report parsers.
 *
 * Each adapter converts a format-specific file (Excel, CSV, PBIX, TWBX, QVF)
 * into ParsedQuery[] items with identical shape to SQL-derived queries so the
 * KPI overlap scoring pipeline (overlap.ts) requires no changes.
 *
 * Supported formats:
 *   .xlsx / .xls  — Microsoft Excel workbooks (SheetJS)
 *   .csv          — Comma-separated values (built-in parsing)
 *   .pbix         — Power BI Desktop files (ZIP + JSON model schema)
 *   .twbx / .twb  — Tableau packaged / unpackaged workbooks (ZIP + XML)
 *   .qvf          — Qlik Sense app bundles (ZIP + JSON app manifest)
 */

import { readFile } from 'fs/promises';
import { basename, extname } from 'path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import type { ExtractedKpi, ParsedQuery } from './parser.js';
import { kpiNameFromFile } from './parser.js';

// ── shared helpers ─────────────────────────────────────────────────────────────

function inferAgg(name: string): string {
  const n = name.toLowerCase();
  if (/\b(count|cnt|num_|number_of|num\b)\b/.test(n))                             return 'COUNT';
  if (/\b(sum|total|revenue|cost|amount|spend|volume|quantity|sales|budget)\b/.test(n)) return 'SUM';
  if (/\b(avg|average|mean|rate|pct|percent|ratio|score|index|latency|tenure)\b/.test(n)) return 'AVG';
  if (/\b(max|peak|highest|maximum)\b/.test(n))                                    return 'MAX';
  if (/\b(min|lowest|minimum)\b/.test(n))                                          return 'MIN';
  return 'SUM';
}

function toAlias(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function makeKpi(rawName: string, queryFile: string): ExtractedKpi {
  const alias = toAlias(rawName);
  const agg   = inferAgg(rawName);
  return { alias, agg, column: alias, formula: `${agg}([${rawName}])`, queryFile };
}

// Heuristic: dimension suffixes are excluded; known measure keywords are included.
const DIM_RX     = /(_id|_key|_code|_date|_type|_flag|_desc|_category|_status|_name)$/i;
const MEASURE_RX = /total|count|sum|avg|average|revenue|cost|amount|quantity|volume|rate|pct|percent|score|index|ratio|spend|budget|margin|profit|loss|growth|ytd|mtd|qtd|latency|throughput|churn|tenure|headcount|hire|attrition/i;

function isMeasureHeader(h: string): boolean {
  return Boolean(h) && !DIM_RX.test(h) && MEASURE_RX.test(h);
}

function tableSlug(filePath: string): string {
  return basename(filePath, extname(filePath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function blankQuery(file: string, label: string): ParsedQuery {
  return {
    filename: file, kpiName: label,
    sql: `-- No KPIs extracted from ${file}`,
    kpis: [], tables: [], filters: [], groupBy: [], joins: [],
  };
}

// ── Excel (.xlsx / .xls) ──────────────────────────────────────────────────────

export async function parseExcelFile(filePath: string): Promise<ParsedQuery[]> {
  const buf     = await readFile(filePath);
  const wb      = XLSX.read(buf, { type: 'buffer' });
  const queries: ParsedQuery[] = [];
  const base    = tableSlug(filePath);

  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1 });
    if (!rows.length) continue;

    const headers  = (rows[0] as unknown[]).map(h => String(h ?? '').trim()).filter(Boolean);
    const measures = headers.filter(isMeasureHeader);
    const kpiSrc   = measures.length ? measures : headers.slice(0, 12);
    const kpis     = kpiSrc.map(h => makeKpi(h, basename(filePath)));
    const preview  = kpiSrc.slice(0, 5).join(', ') + (kpiSrc.length > 5 ? ` … +${kpiSrc.length - 5} more` : '');

    queries.push({
      filename: `${basename(filePath)}:${sheetName}`,
      kpiName:  sheetName.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      sql:      `-- Excel workbook: ${basename(filePath)}\n-- Sheet: ${sheetName}\n-- Measures: ${preview}`,
      kpis,
      tables:  [`${base}_${toAlias(sheetName)}`],
      filters: [],
      groupBy: [],
      joins:   [],
    });
  }

  return queries;
}

// ── CSV (.csv) ─────────────────────────────────────────────────────────────────

export async function parseCsvFile(filePath: string): Promise<ParsedQuery> {
  const raw     = await readFile(filePath, 'utf-8');
  const lines   = raw.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return blankQuery(basename(filePath), kpiNameFromFile(filePath));

  const headers  = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const measures = headers.filter(isMeasureHeader);
  const kpiSrc   = measures.length ? measures : headers.slice(0, 12);

  return {
    filename: basename(filePath),
    kpiName:  kpiNameFromFile(filePath),
    sql:      `-- CSV: ${basename(filePath)}\n-- Headers: ${headers.slice(0, 8).join(', ')}`,
    kpis:     kpiSrc.map(h => makeKpi(h, basename(filePath))),
    tables:   [tableSlug(filePath)],
    filters:  [],
    groupBy:  [],
    joins:    [],
  };
}

// ── Power BI (.pbix) ──────────────────────────────────────────────────────────

interface PbixMeasure     { name: string; expression?: string; }
interface PbixTableEntry  { name: string; measures?: PbixMeasure[]; columns?: Array<{ name: string }>; }
interface PbixModel       { tables?: PbixTableEntry[]; }

function decodeModelBuffer(buf: Buffer): string {
  // PBIX model files are UTF-16LE, sometimes with a BOM
  if (buf[0] === 0xFF && buf[1] === 0xFE) {
    return buf.subarray(2).toString('utf16le');
  }
  if (buf[0] === 0xFE && buf[1] === 0xFF) {
    // UTF-16BE — swap bytes
    const swapped = Buffer.from(buf.subarray(2));
    for (let i = 0; i < swapped.length - 1; i += 2) {
      const tmp = swapped[i]; swapped[i] = swapped[i + 1]; swapped[i + 1] = tmp;
    }
    return swapped.toString('utf16le');
  }
  // Try UTF-16LE without BOM first (common for PBIX), fall back to UTF-8
  try {
    const s = buf.toString('utf16le').replace(/^﻿/, '');
    JSON.parse(s.substring(0, 64)); // quick sanity check
    return s;
  } catch {
    return buf.toString('utf-8').replace(/^﻿/, '');
  }
}

export function parsePbixFile(filePath: string): ParsedQuery[] {
  try {
    const zip    = new AdmZip(filePath);
    const entry  = zip.getEntry('DataModelSchema') ?? zip.getEntry('DataModel');
    if (!entry) return [];

    const model  = JSON.parse(decodeModelBuffer(entry.getData())) as PbixModel;
    const queries: ParsedQuery[] = [];

    for (const table of model.tables ?? []) {
      const measures = table.measures ?? [];
      if (!measures.length) continue;

      const kpis = measures.map(m => makeKpi(m.name, basename(filePath)));
      queries.push({
        filename: `${basename(filePath)}:${table.name}`,
        kpiName:  table.name,
        sql:      `-- Power BI: ${basename(filePath)}\n-- Table: ${table.name}\n-- Measures: ${measures.slice(0, 5).map(m => m.name).join(', ')}`,
        kpis,
        tables:  [toAlias(table.name)],
        filters: [],
        groupBy: [],
        joins:   [],
      });
    }

    return queries;
  } catch {
    return [];
  }
}

// ── Tableau (.twbx / .twb) ───────────────────────────────────────────────────

interface TwbColumn {
  '@_name'?:     string;
  '@_caption'?:  string;
  '@_role'?:     string;
  '@_datatype'?: string;
  calculation?:  { '@_formula'?: string };
}

interface TwbDatasource {
  '@_name'?:    string;
  '@_caption'?: string;
  column?:      TwbColumn | TwbColumn[];
}

interface TwbWorkbook {
  workbook?: {
    datasources?: { datasource?: TwbDatasource | TwbDatasource[] };
  };
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (_name, _jpath, _isLeaf, _isAttribute) => false,
});

function parseTwbXml(xml: string, sourceFile: string): ParsedQuery[] {
  try {
    const doc   = xmlParser.parse(xml) as TwbWorkbook;
    const dsSrc = doc.workbook?.datasources?.datasource;
    if (!dsSrc) return [];

    const dsList: TwbDatasource[] = Array.isArray(dsSrc) ? dsSrc : [dsSrc];
    const queries: ParsedQuery[] = [];

    for (const ds of dsList) {
      const dsName = (ds['@_caption'] ?? ds['@_name'] ?? 'Unknown').replace(/\s+/g, ' ').trim();
      if (dsName.toLowerCase() === 'parameters') continue;

      const colSrc: TwbColumn[] = ds.column
        ? (Array.isArray(ds.column) ? ds.column : [ds.column])
        : [];

      // Tableau marks measures with role="measure"; skip system fields like [Number of Records]
      const measureCols = colSrc.filter(
        c => c['@_role'] === 'measure' &&
             c['@_name'] &&
             !String(c['@_name']).includes('Number of Records'),
      );

      if (!measureCols.length) continue;

      const kpis = measureCols.map(c => {
        const raw = (c['@_caption'] ?? c['@_name'] ?? '').replace(/^\[|\]$/g, '');
        return makeKpi(raw, sourceFile);
      });

      queries.push({
        filename: `${sourceFile}:${dsName}`,
        kpiName:  dsName,
        sql:      `-- Tableau: ${sourceFile}\n-- Datasource: ${dsName}\n-- Measures: ${measureCols.slice(0, 5).map(c => (c['@_caption'] ?? c['@_name'] ?? '').replace(/^\[|\]$/g, '')).join(', ')}`,
        kpis,
        tables:  [toAlias(dsName)],
        filters: [],
        groupBy: [],
        joins:   [],
      });
    }

    return queries;
  } catch {
    return [];
  }
}

export async function parseTwbxFile(filePath: string): Promise<ParsedQuery[]> {
  const ext = extname(filePath).toLowerCase();

  if (ext === '.twb') {
    // Unpackaged workbook — raw XML
    const xml = await readFile(filePath, 'utf-8');
    return parseTwbXml(xml, basename(filePath));
  }

  // .twbx is a ZIP archive containing a .twb file
  try {
    const zip      = new AdmZip(filePath);
    const twbEntry = zip.getEntries().find(e => e.entryName.endsWith('.twb'));
    if (!twbEntry) return [];
    return parseTwbXml(twbEntry.getData().toString('utf-8'), basename(filePath));
  } catch {
    return [];
  }
}

// ── Qlik Sense (.qvf) ─────────────────────────────────────────────────────────

interface QvfMeasureDef  { qDef?: string; qLabel?: string; }
interface QvfMeasureItem { qMeasure?: { qLabel?: string; qDef?: QvfMeasureDef }; qLabel?: string; }
interface QvfApp {
  masterobject?:         QvfMeasureItem[];
  qAppObjectDictionary?: Record<string, { qItems?: QvfMeasureItem[] }>;
}

export function parseQvfFile(filePath: string): ParsedQuery[] {
  try {
    const zip   = new AdmZip(filePath);
    const entry = zip.getEntry('app.json') ?? zip.getEntries().find(e => e.entryName.endsWith('.json'));
    if (!entry) return [];

    const app   = JSON.parse(entry.getData().toString('utf-8')) as QvfApp;

    const items: QvfMeasureItem[] = [
      ...(app.masterobject ?? []),
      ...Object.values(app.qAppObjectDictionary ?? {}).flatMap(v => v.qItems ?? []),
    ];

    const kpis: ExtractedKpi[] = [];
    for (const item of items) {
      const label = item.qMeasure?.qDef?.qLabel ?? item.qMeasure?.qLabel ?? item.qLabel ?? '';
      if (!label) continue;
      kpis.push(makeKpi(label, basename(filePath)));
    }

    if (!kpis.length) return [];

    return [{
      filename: basename(filePath),
      kpiName:  kpiNameFromFile(filePath),
      sql:      `-- Qlik: ${basename(filePath)}\n-- Measures: ${kpis.slice(0, 5).map(k => k.alias).join(', ')}`,
      kpis,
      tables:  [tableSlug(filePath)],
      filters: [],
      groupBy: [],
      joins:   [],
    }];
  } catch {
    return [];
  }
}
