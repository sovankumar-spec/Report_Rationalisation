/**
 * Generates sample-data-powerbi/
 *   source/  — 9 PowerBI dashboards across 3 domains (3 per domain)
 *   target/  — 3 Looker dashboards (1 canonical per domain)
 *
 * Expected outcomes (by design):
 *   Sales     src-pbi-01  → Rationalize  (100 % overlap)
 *             src-pbi-02  → Consolidate  (~87 % overlap)
 *             src-pbi-03  → Migrate      (~50 % overlap)
 *   Finance   src-pbi-04  → Rationalize  (100 %)
 *             src-pbi-05  → Consolidate  (~87 %)
 *             src-pbi-06  → Migrate      (~40 %)
 *   Operations src-pbi-07 → Rationalize  (100 %)
 *              src-pbi-08 → Consolidate  (~80 %)
 *              src-pbi-09 → Migrate      (~29 %)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'sample-data-powerbi');
const SRC  = join(ROOT, 'source');
const TGT  = join(ROOT, 'target');

function mkdir(p) { mkdirSync(p, { recursive: true }); }

function write(dir, id, meta, sqls) {
  mkdir(dir);
  writeFileSync(
    join(dir, 'report.json'),
    JSON.stringify({ id, ...meta }, null, 2),
  );
  for (const [file, sql] of Object.entries(sqls)) {
    writeFileSync(join(dir, file), sql);
  }
}

// ─── TARGET: 3 Looker canonical reference reports ────────────────────────────

write(
  join(TGT, 'tgt-looker-01-sales-analytics'),
  'tgt-looker-01-sales-analytics',
  {
    name: 'Sales Analytics',
    domain: 'Sales',
    owner: 'Priya Sharma',
    description:
      'Looker canonical Sales analytics report. Governs revenue, deal, pipeline, and quota KPIs across all sales channels. Acts as the single authoritative source for Sales reporting in the Looker estate.',
    usageFrequency: 42,
    platform: 'Looker',
  },
  {
    'sales_analytics.sql': `-- Sales Analytics
SELECT
  SUM(s.revenue) AS total_revenue,
  AVG(s.deal_size) AS avg_deal_size,
  COUNT(s.deal_id) AS deals_closed,
  SUM(s.pipeline_value) AS pipeline_value,
  AVG(s.win_rate) AS win_rate,
  SUM(s.quota) AS quota_attainment,
  s.region
FROM fact_sales s
JOIN dim_product p ON s.product_id = p.product_id
JOIN dim_customer c ON s.customer_id = c.customer_id
JOIN dim_date d ON s.date_id = d.date_id
GROUP BY s.region`,
  },
);

write(
  join(TGT, 'tgt-looker-02-finance-hub'),
  'tgt-looker-02-finance-hub',
  {
    name: 'Finance Hub',
    domain: 'Finance',
    owner: 'Marcus Webb',
    description:
      'Looker canonical Finance report. Governs P&L, budget, and margin KPIs across all cost centres. Authoritative reference for Finance reporting in the Looker estate.',
    usageFrequency: 38,
    platform: 'Looker',
  },
  {
    'finance_hub.sql': `-- Finance Hub
SELECT
  SUM(f.revenue) AS total_revenue,
  SUM(f.expenses) AS total_expenses,
  SUM(f.gross_profit) AS gross_profit,
  AVG(f.budget_variance) AS budget_variance,
  SUM(f.net_income) AS net_income,
  AVG(f.operating_margin) AS operating_margin,
  f.cost_center
FROM fact_financials f
JOIN dim_account a ON f.account_id = a.account_id
JOIN dim_cost_center cc ON f.cost_center_id = cc.cost_center_id
JOIN dim_period p ON f.period_id = p.period_id
GROUP BY f.cost_center`,
  },
);

write(
  join(TGT, 'tgt-looker-03-ops-intelligence'),
  'tgt-looker-03-ops-intelligence',
  {
    name: 'Operations Intelligence',
    domain: 'Operations',
    owner: 'Dana Kim',
    description:
      'Looker canonical Operations report. Governs cycle time, OEE, utilisation, defect, and incident KPIs across all facilities. Authoritative reference for Operations reporting in the Looker estate.',
    usageFrequency: 29,
    platform: 'Looker',
  },
  {
    'ops_intelligence.sql': `-- Operations Intelligence
SELECT
  AVG(o.cycle_time) AS avg_cycle_time,
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.incident_id) AS incident_count,
  AVG(o.oee_score) AS oee_score,
  SUM(o.units_produced) AS units_produced,
  AVG(o.defect_rate) AS defect_rate,
  o.facility_id
FROM fact_operations o
JOIN dim_facility f ON o.facility_id = f.facility_id
JOIN dim_workforce w ON o.workforce_id = w.workforce_id
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY o.facility_id`,
  },
);

// ─── SOURCE: 9 PowerBI dashboards ────────────────────────────────────────────

// ── Sales (3) ─────────────────────────────────────────────────────────────────

// src-pbi-01  →  Rationalize (100 %)
// All 6 aliases match, all 6 columns match, all 4 tables match.
write(
  join(SRC, 'src-pbi-01-sales-overview-dashboard'),
  'src-pbi-01-sales-overview-dashboard',
  {
    name: 'Sales Overview Dashboard',
    domain: 'Sales',
    owner: 'Alex Torres',
    description:
      'Executive PowerBI dashboard providing a top-level view of revenue, pipeline, deal velocity, win rate and quota attainment. Built on the same fact_sales grain as the Looker reference; a strong rationalization candidate.',
    usageFrequency: 18,
    platform: 'PowerBI',
  },
  {
    'sales_overview.sql': `-- Sales Overview Dashboard
SELECT
  SUM(s.revenue) AS total_revenue,
  AVG(s.deal_size) AS avg_deal_size,
  COUNT(s.deal_id) AS deals_closed,
  SUM(s.pipeline_value) AS pipeline_value,
  AVG(s.win_rate) AS win_rate,
  SUM(s.quota) AS quota_attainment,
  s.region
FROM fact_sales s
JOIN dim_product p ON s.product_id = p.product_id
JOIN dim_customer c ON s.customer_id = c.customer_id
JOIN dim_date d ON s.date_id = d.date_id
GROUP BY s.region`,
  },
);

// src-pbi-02  →  Consolidate (~87 %)
// 5/6 aliases match (forecast_accuracy missing in target), all source tables covered.
write(
  join(SRC, 'src-pbi-02-revenue-pipeline-report'),
  'src-pbi-02-revenue-pipeline-report',
  {
    name: 'Revenue Pipeline Report',
    domain: 'Sales',
    owner: 'Jordan Lee',
    description:
      'PowerBI pipeline report tracking revenue progress against forecast, deal-stage conversion, and win rate trends. Adds a forecast_accuracy KPI not yet present in the Looker reference — a consolidation gap to be filled.',
    usageFrequency: 11,
    platform: 'PowerBI',
  },
  {
    'revenue_pipeline.sql': `-- Revenue Pipeline Report
SELECT
  SUM(s.revenue) AS total_revenue,
  AVG(s.deal_size) AS avg_deal_size,
  COUNT(s.deal_id) AS deals_closed,
  SUM(s.pipeline_value) AS pipeline_value,
  AVG(s.win_rate) AS win_rate,
  AVG(s.forecast_accuracy) AS forecast_accuracy,
  s.stage
FROM fact_sales s
JOIN dim_product p ON s.product_id = p.product_id
JOIN dim_customer c ON s.customer_id = c.customer_id
GROUP BY s.stage`,
  },
);

// src-pbi-03  →  Migrate (~50 %)
// Only 2/4 aliases match (total_revenue, avg_deal_size); regional_quota and
// territory_count are new; dim_region not in Looker target.
write(
  join(SRC, 'src-pbi-03-regional-sales-analysis'),
  'src-pbi-03-regional-sales-analysis',
  {
    name: 'Regional Sales Analysis',
    domain: 'Sales',
    owner: 'Sam Patel',
    description:
      'PowerBI report tracking regional quota attainment, territory count, and revenue split by geography. Uses region and territory dimensions not modelled in the Looker Sales Analytics reference — migration required to build regional coverage.',
    usageFrequency: 7,
    platform: 'PowerBI',
  },
  {
    'regional_sales.sql': `-- Regional Sales Analysis
SELECT
  SUM(s.revenue) AS total_revenue,
  AVG(s.deal_size) AS avg_deal_size,
  SUM(s.regional_quota) AS regional_quota,
  COUNT(s.territory_id) AS territory_count,
  s.region
FROM fact_sales s
JOIN dim_region r ON s.region_id = r.region_id
GROUP BY s.region`,
  },
);

// ── Finance (3) ───────────────────────────────────────────────────────────────

// src-pbi-04  →  Rationalize (100 %)
write(
  join(SRC, 'src-pbi-04-pl-dashboard'),
  'src-pbi-04-pl-dashboard',
  {
    name: 'P&L Dashboard',
    domain: 'Finance',
    owner: 'Rachel Stone',
    description:
      'PowerBI Profit & Loss dashboard covering revenue, expenses, gross profit, net income, budget variance and operating margin. Identical KPI set and schema to the Looker Finance Hub — prime rationalization target.',
    usageFrequency: 22,
    platform: 'PowerBI',
  },
  {
    'pl_dashboard.sql': `-- P&L Dashboard
SELECT
  SUM(f.revenue) AS total_revenue,
  SUM(f.expenses) AS total_expenses,
  SUM(f.gross_profit) AS gross_profit,
  AVG(f.budget_variance) AS budget_variance,
  SUM(f.net_income) AS net_income,
  AVG(f.operating_margin) AS operating_margin,
  f.cost_center
FROM fact_financials f
JOIN dim_account a ON f.account_id = a.account_id
JOIN dim_cost_center cc ON f.cost_center_id = cc.cost_center_id
JOIN dim_period p ON f.period_id = p.period_id
GROUP BY f.cost_center`,
  },
);

// src-pbi-05  →  Consolidate (~87 %)
// 5/6 aliases match; capex_spend is a source-only KPI; dim_period not used.
write(
  join(SRC, 'src-pbi-05-budget-tracker'),
  'src-pbi-05-budget-tracker',
  {
    name: 'Budget Tracker',
    domain: 'Finance',
    owner: 'Chris Nguyen',
    description:
      'PowerBI budget monitoring report with P&L KPIs plus a CAPEX spend measure not yet tracked in the Looker Finance Hub. All other KPIs align to the reference — extend Looker with capex_spend to consolidate.',
    usageFrequency: 14,
    platform: 'PowerBI',
  },
  {
    'budget_tracker.sql': `-- Budget Tracker
SELECT
  SUM(f.revenue) AS total_revenue,
  SUM(f.expenses) AS total_expenses,
  SUM(f.gross_profit) AS gross_profit,
  AVG(f.budget_variance) AS budget_variance,
  SUM(f.net_income) AS net_income,
  SUM(f.capex_spend) AS capex_spend,
  f.cost_center
FROM fact_financials f
JOIN dim_account a ON f.account_id = a.account_id
JOIN dim_cost_center cc ON f.cost_center_id = cc.cost_center_id
GROUP BY f.cost_center`,
  },
);

// src-pbi-06  →  Migrate (~40 %)
// Only 1/4 aliases match (total_revenue); cash-flow KPIs are entirely absent
// from the Looker Finance Hub reference.
write(
  join(SRC, 'src-pbi-06-cash-flow-monitor'),
  'src-pbi-06-cash-flow-monitor',
  {
    name: 'Cash Flow Monitor',
    domain: 'Finance',
    owner: 'Taylor Reeves',
    description:
      'PowerBI cash flow report tracking operating, investing and financing activities plus the cash conversion cycle. The Looker Finance Hub has no cash-flow measures — a dedicated Looker Cash Flow explore must be built before this report can be retired.',
    usageFrequency: 9,
    platform: 'PowerBI',
  },
  {
    'cash_flow_monitor.sql': `-- Cash Flow Monitor
SELECT
  SUM(f.revenue) AS total_revenue,
  SUM(f.operating_cash) AS operating_cash_flow,
  SUM(f.financing_cash) AS financing_activities,
  AVG(f.cash_conversion) AS cash_conversion_cycle,
  f.period
FROM fact_financials f
JOIN dim_account a ON f.account_id = a.account_id
GROUP BY f.period`,
  },
);

// ── Operations (3) ────────────────────────────────────────────────────────────

// src-pbi-07  →  Rationalize (100 %)
write(
  join(SRC, 'src-pbi-07-ops-kpi-scorecard'),
  'src-pbi-07-ops-kpi-scorecard',
  {
    name: 'Operations KPI Scorecard',
    domain: 'Operations',
    owner: 'Morgan Ellis',
    description:
      'PowerBI operations scorecard covering cycle time, utilisation, OEE, defect rate, incident count and units produced. Identical KPI set and schema to the Looker Operations Intelligence reference — ready for rationalization.',
    usageFrequency: 16,
    platform: 'PowerBI',
  },
  {
    'ops_kpi_scorecard.sql': `-- Operations KPI Scorecard
SELECT
  AVG(o.cycle_time) AS avg_cycle_time,
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.incident_id) AS incident_count,
  AVG(o.oee_score) AS oee_score,
  SUM(o.units_produced) AS units_produced,
  AVG(o.defect_rate) AS defect_rate,
  o.facility_id
FROM fact_operations o
JOIN dim_facility f ON o.facility_id = f.facility_id
JOIN dim_workforce w ON o.workforce_id = w.workforce_id
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY o.facility_id`,
  },
);

// src-pbi-08  →  Consolidate (~80 %)
// 5/6 aliases match; supplier_lead_time is source-only; dim_supplier not in target.
write(
  join(SRC, 'src-pbi-08-supply-chain-metrics'),
  'src-pbi-08-supply-chain-metrics',
  {
    name: 'Supply Chain Metrics',
    domain: 'Operations',
    owner: 'Blake Foster',
    description:
      'PowerBI supply chain report extending operational KPIs with supplier lead time. Core cycle time, utilisation, incident, defect and production measures align to the Looker Operations Intelligence reference — add supplier_lead_time to Looker to consolidate.',
    usageFrequency: 12,
    platform: 'PowerBI',
  },
  {
    'supply_chain_metrics.sql': `-- Supply Chain Metrics
SELECT
  AVG(o.cycle_time) AS avg_cycle_time,
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.incident_id) AS incident_count,
  SUM(o.units_produced) AS units_produced,
  AVG(o.defect_rate) AS defect_rate,
  AVG(o.supplier_lead_time) AS supplier_lead_time,
  o.facility_id
FROM fact_operations o
JOIN dim_supplier s ON o.supplier_id = s.supplier_id
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY o.facility_id`,
  },
);

// src-pbi-09  →  Migrate (~29 %)
// Only 1/5 aliases match (utilization_rate); headcount, attrition, engagement and
// training are entirely absent from the Looker Operations Intelligence reference.
write(
  join(SRC, 'src-pbi-09-workforce-dashboard'),
  'src-pbi-09-workforce-dashboard',
  {
    name: 'Workforce Dashboard',
    domain: 'Operations',
    owner: 'Casey Murphy',
    description:
      'PowerBI workforce report tracking headcount, attrition, employee engagement and training completion. People-analytics KPIs are not covered by the Looker Operations Intelligence reference — a dedicated Looker Workforce explore is required before this report can be retired.',
    usageFrequency: 10,
    platform: 'PowerBI',
  },
  {
    'workforce_dashboard.sql': `-- Workforce Dashboard
SELECT
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.employee_id) AS headcount,
  AVG(o.attrition_rate) AS attrition_rate,
  AVG(o.engagement_score) AS engagement_score,
  COUNT(o.training_hours) AS training_completion,
  o.department
FROM fact_operations o
JOIN dim_workforce w ON o.workforce_id = w.workforce_id
JOIN dim_department d ON o.department_id = d.department_id
GROUP BY o.department`,
  },
);

console.log('✓  sample-data-powerbi generated');
console.log('');
console.log('Source path : ' + SRC);
console.log('Target path : ' + TGT);
console.log('');
console.log('Expected dispositions:');
console.log('  Sales     → Rationalize (src-pbi-01), Consolidate (src-pbi-02), Migrate (src-pbi-03)');
console.log('  Finance   → Rationalize (src-pbi-04), Consolidate (src-pbi-05), Migrate (src-pbi-06)');
console.log('  Operations→ Rationalize (src-pbi-07), Consolidate (src-pbi-08), Migrate (src-pbi-09)');
