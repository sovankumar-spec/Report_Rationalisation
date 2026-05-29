# Report Rationalizer — Skills & Capabilities

This document describes what the Report Rationalizer agent can analyse, compare, and decide — covering supported data formats, business domains, disposition logic, and the sample datasets bundled with the project.

---

## What the Agent Does

The agent accepts two folder paths at runtime — a **source estate** (legacy BI reports) and a **reference catalog** (governed target reports) — and produces one disposition per source report:

| Disposition | Overlap | Meaning |
|---|---|---|
| **Rationalize** | 100 % | Every source KPI is already covered by the reference. Retire the source. |
| **Consolidate** | 70 – 99 % | Most KPIs overlap. Extend the reference to absorb the gap KPIs, then retire. |
| **Migrate** | < 70 % | Insufficient coverage. Rebuild the source capability on the governed platform. |

Overlap is computed deterministically from SQL evidence — no manual scoring required.

---

## Overlap Scoring Formula

```
overlap % = (alias_score × 0.50) + (column_score × 0.30) + (table_score × 0.20)
```

| Signal | Weight | What it measures |
|---|---|---|
| **KPI alias match** | 50 % | Source KPI name (`total_revenue`) present in target |
| **Column name match** | 30 % | Underlying column (`revenue`) shared between source and target |
| **Normalised table match** | 20 % | Base table name after stripping vendor prefixes (`fact_sales` → `sales`) |

Schema prefixes stripped before matching: `fact_`, `dim_`, `ref_`, `tgt_`, `vz_`, `mkt_`, `ops_`, `hr_`, `fin_`, `lgl_`, `cs_`, `it_`, `scm_`, `vc_`, `rc_`.

---

## Supported Input Format

Each report (source or target) lives in its own folder containing exactly two things:

```
<report-folder>/
  report.json     ← report identity and metadata
  <name>.sql      ← one or more SQL files (KPI queries)
```

### `report.json` schema

```json
{
  "id":             "src-pbi-01-sales-overview-dashboard",
  "name":           "Sales Overview Dashboard",
  "domain":         "Sales",
  "owner":          "Alex Torres",
  "description":    "Executive PowerBI dashboard ...",
  "usageFrequency": 18,
  "platform":       "PowerBI"
}
```

### SQL KPI extraction

The parser extracts any `AGG(table.column) AS alias` pattern:

```sql
SELECT
  SUM(s.revenue)        AS total_revenue,
  AVG(s.deal_size)      AS avg_deal_size,
  COUNT(s.deal_id)      AS deals_closed
FROM fact_sales s
JOIN dim_customer c ON s.customer_id = c.customer_id
GROUP BY s.region
```

Supported aggregations: `SUM`, `COUNT`, `AVG`, `MIN`, `MAX`.  
Dimension columns (non-aggregated) are parsed for lineage display but do not affect the overlap score.

---

## Supported Source Platforms

The agent is platform-agnostic — any BI tool whose queries can be expressed as SQL is supported.

| Platform | Sample dataset included |
|---|---|
| **PowerBI** | `sample-data-powerbi/source/` (9 reports) |
| **Tableau** | Use same folder format; SQL extracted from underlying datasource queries |
| **Looker** | `sample-data-powerbi/target/` (3 LookML-equivalent SQL reports) |
| **Generic SQL** | `sample-data/` (5 reports) |
| **CSV-backed** | `sample-data-csv/` (10 source + 5 target) |
| **Excel-derived** | `sample-data-excel/` (40 source + 31 target) |

---

## Bundled Sample Datasets

### 1 · Generic (`sample-data/`)

5 source reports, 4 reference reports — telecoms/billing domain. Good for a quick first run.

| Source | Domain | Expected |
|---|---|---|
| Customer Revenue Report | Billing | Rationalize |
| Churn Analysis | Subscriber | Consolidate |
| Network Performance | Network | Migrate |
| Sales Pipeline | Sales | Consolidate |
| HR Headcount | HR | Migrate |

**Paths to paste into the agent:**
- Source: `<project-root>/sample-data/source`
- Target: `<project-root>/sample-data/target`

---

### 2 · CSV (`sample-data-csv/`)

10 source reports, 5 reference reports — telecoms domains (Billing, Subscriber, Network, Sales, Marketing).

**Paths to paste into the agent:**
- Source: `<project-root>/sample-data-csv/source`
- Target: `<project-root>/sample-data-csv/target`

---

### 3 · Excel-derived (`sample-data-excel/`)

40 source reports, 31 reference reports — 9 business domains derived from a real Report Modernization Strategy spreadsheet.

| Domain | Source count | Target count |
|---|---|---|
| Customer Service | 4 | 3 |
| Finance | 8 | 7 |
| HR | 5 | 4 |
| IT | 4 | 3 |
| Marketing | 6 | 4 |
| Operations | 5 | 4 |
| Product | 4 | 3 |
| Risk & Compliance | 4 | 3 |
| Sales | 5 | 4 |

**Paths to paste into the agent:**
- Source: `<project-root>/sample-data-excel/source`
- Target: `<project-root>/sample-data-excel/target`

---

### 4 · PowerBI → Looker (`sample-data-powerbi/`)

9 PowerBI source dashboards compared against 3 canonical Looker reference reports across 3 domains. Designed to show a balanced 3 × 3 grid of all three disposition outcomes.

| Report | Domain | Expected |
|---|---|---|
| Sales Overview Dashboard | Sales | **Rationalize** — identical KPI set |
| Revenue Pipeline Report | Sales | **Consolidate** — `forecast_accuracy` gap |
| Regional Sales Analysis | Sales | **Migrate** — regional dims not in Looker |
| P&L Dashboard | Finance | **Rationalize** — identical KPI set |
| Budget Tracker | Finance | **Consolidate** — `capex_spend` gap |
| Cash Flow Monitor | Finance | **Migrate** — cash-flow KPIs absent |
| Operations KPI Scorecard | Operations | **Rationalize** — identical KPI set |
| Supply Chain Metrics | Operations | **Consolidate** — `supplier_lead_time` gap |
| Workforce Dashboard | Operations | **Migrate** — people-analytics KPIs absent |

**Paths to paste into the agent:**
- Source: `<project-root>/sample-data-powerbi/source`
- Target: `<project-root>/sample-data-powerbi/target`

---

## Workbench Tabs

| Tab | What it shows |
|---|---|
| **Dashboard** | Portfolio-level metrics, disposition distribution, domain filter chips, overlap bucket chart, confidence tiers |
| **Source** | Per-source lineage (table dependencies, coverage matrix, SQL explorer) + metadata subtab |
| **Target** | Per-target lineage (table dependencies, SQL explorer) + metadata subtab |
| **Disposition** | Full governance matrix — Approve, Override, and Remap actions per source report |

---

## Governance Actions (Disposition Tab)

| Action | What it does |
|---|---|
| **Approve** | Marks the AI-generated disposition as analyst-confirmed |
| **Override** | Manually set a different disposition, target, overlap %, and rationale |
| **Remap** | Reassign the source to a different domain and/or reference report; overlap, decision, KPI gaps, and confidence recompute instantly using the same formula as the server |

---

## Domain Filter

The **Dashboard** tab has a domain filter bar. Selecting a domain narrows all stat cards, disposition bars, overlap buckets, and confidence tiers to that domain's reports only. The Disposition tab has its own independent domain drop-down filter that works alongside search and status filters.

---

## Rationale Enrichment (Optional)

If an `OPENAI_API_KEY` is set in `.env`, the agent calls the OpenAI Responses API after the deterministic overlap run to produce per-report narrative rationale, calibrated confidence scores, and KPI gap descriptions.

**Enrichment does not change** overlap percentages, target mappings, or disposition bands — those are mathematical and immutable.

If enrichment is unavailable or fails, the agent falls back gracefully to deterministic decisions with no red errors shown.

---

## Running the Agent Locally

```bash
# Install dependencies
npm install

# Start both frontend (port 5173) and backend (port 3001) in one command
npm run dev

# Type-check only (no emit)
npm run typecheck

# Production build
npm run build
```

Copy a source and target path from the sample datasets above, paste into the **Analysis Intake** banner on the Dashboard tab, and click **Load reports**.

---

## Generating New Sample Data

Three generator scripts live in `scripts/`:

| Script | What it generates |
|---|---|
| `generate-excel-sample-data.mjs` | 40 source + 31 target Excel-derived SQL reports |
| `generate-powerbi-looker-data.mjs` | 9 PowerBI source + 3 Looker target SQL reports |

Run with:
```bash
node scripts/generate-powerbi-looker-data.mjs
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Optional | Enables rationale enrichment via OpenAI |
| `OPENAI_MODEL` | Optional | Override model (default: `gpt-4.1-mini`) |
| `PORT` | Optional | Backend port (default: `3001`) |

Copy `.env.example` to `.env` and fill in the values you need.
