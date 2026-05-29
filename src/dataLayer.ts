import { Decision, FullReport, SourceReport, TargetDetailReport, TargetReport } from './types';

export interface RationalizationDecision {
  sourceId: string;
  sourceName: string;
  domain: string;
  targetId: string | null;
  targetName: string | null;
  overlapPercent: number;
  decision: Decision;
  confidenceScore: number;
  rationale: string;
  kpiGaps: string[];
  status: 'Pending' | 'Approved' | 'Overridden';
  source: 'analysis' | 'manual';
}

export interface RationalizationResponse {
  status: 'ok' | 'not_configured' | 'error';
  model?: string;
  generatedAt?: string;
  message?: string;
  decisions: RationalizationDecision[];
}

export interface ReportInventory {
  sources: FullReport[];
  sourceIndex: SourceReport[];
  targetIndex: TargetReport[];
  targets: TargetDetailReport[];
}

/**
 * Load the report inventory by submitting folder paths to the backend.
 * This is the primary runtime data-loading path.
 */
export async function loadReportInventoryFromPaths(
  sourcePath: string,
  targetPath: string,
): Promise<ReportInventory> {
  const response = await fetch('/api/load-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePath, targetPath }),
  });

  const data = await response.json() as
    | ({ status: 'ok' } & ReportInventory)
    | { status: 'error'; error: { code: string; message: string; details?: unknown } };

  if (!response.ok || data.status === 'error') {
    const msg = data.status === 'error' ? data.error.message : `Server error ${response.status}`;
    throw new Error(msg);
  }

  return {
    sources:     (data as { status: 'ok' } & ReportInventory).sources,
    sourceIndex: (data as { status: 'ok' } & ReportInventory).sourceIndex,
    targetIndex: (data as { status: 'ok' } & ReportInventory).targetIndex,
    targets:     (data as { status: 'ok' } & ReportInventory).targets,
  };
}

export function compactSourceReport(report: FullReport) {
  return {
    id: report.id,
    name: report.name,
    domain: report.domain,
    owner: report.owner,
    description: report.description,
    usageFrequency: report.usageFrequency,
    numQueries: report.numQueries,
    tables: report.allTables,
    // Deterministic ground truth from the backend overlap matrix; enrichment must not change these.
    deterministic: {
      overlapPercent:      report.overlapPercent,
      decision:            report.decision,
      bestMatchTargetId:   report.bestMatchTargetId,
      bestMatchTargetName: report.bestMatchTargetName,
      confidenceSeed:      report.confidenceScore,
      kpiGapsHeuristic:    report.kpiDelta.filter(k => k.missingInTarget).map(k => k.name),
    },
    kpis: report.allKpis.map(k => ({
      alias: k.alias,
      formula: k.formula,
      column: k.column,
      queryFile: k.queryFile,
    })),
    queries: report.queries.source.map(q => ({
      id: q.id,
      kpiName: q.kpiName,
      tables: q.tables,
      aggregations: q.aggregations,
      filters: q.filters,
      joins: q.joins,
      groupBy: q.groupBy,
      sqlExcerpt: q.fullSql.slice(0, 1200),
    })),
  };
}

export function compactTargetReport(report: TargetDetailReport) {
  return {
    id: report.id,
    name: report.name,
    domain: report.domain,
    owner: report.owner,
    description: report.description,
    numQueries: report.numQueries,
    tables: report.allTables,
    kpis: report.kpis.map(k => ({
      alias: k.alias,
      formula: k.formula,
      column: k.column,
      queryFile: k.queryFile,
    })),
    queries: report.queries.map(q => ({
      id: q.id,
      kpiName: q.kpiName,
      tables: q.tables,
      aggregations: q.aggregations,
      filters: q.filters,
      joins: q.joins,
      groupBy: q.groupBy,
      sqlExcerpt: q.fullSql.slice(0, 1200),
    })),
  };
}

export async function requestRationalizationAnalysis(
  sources: FullReport[],
  targets: TargetDetailReport[],
): Promise<RationalizationResponse> {
  const response = await fetch('/api/rationalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sources: sources.map(compactSourceReport),
      targets: targets.map(compactTargetReport),
    }),
  });

  if (!response.ok) {
    return {
      status: 'error',
      message: `Analysis request failed with HTTP ${response.status}.`,
      decisions: [],
    };
  }

  return response.json() as Promise<RationalizationResponse>;
}
