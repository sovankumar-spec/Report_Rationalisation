import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'C:/Users/sovan/OneDrive/Desktop/Reprt agent/RR/sample-data-excel';

// Helper: build SQL string from KPI triples [agg, col, alias], tables, dim columns
function makeSql(title, kpis, tables, dims = []) {
  const selects = kpis.map(([agg, col, alias]) => `  ${agg}(t.${col}) AS ${alias}`);
  if (dims.length) dims.forEach(d => selects.push(`  t.${d}`));
  const [first, ...rest] = tables;
  const joins = rest.map(tbl => `JOIN ${tbl} j ON t.id = j.id`).join('\n');
  const gb = dims.length ? `\nGROUP BY ${dims.map(d => `t.${d}`).join(', ')}` : '\nGROUP BY t.id';
  return `-- ${title}\nSELECT\n${selects.join(',\n')}\nFROM ${first} t\n${joins}${gb}`;
}

// Helper: write one report folder
function writeReport(baseDir, slug, meta, sqlName, sqlContent) {
  const dir = join(ROOT, baseDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'report.json'), JSON.stringify(meta, null, 2));
  writeFileSync(join(dir, `${sqlName}.sql`), sqlContent);
  console.log(`  wrote ${baseDir}/${slug}`);
}

// ── Rationalize shared KPI sets (source = target, same tables) ────────────────
const R = {
  ticket_resolution: {
    kpis: [['AVG','resolution_hours','avg_resolution_hours'],['COUNT','sla_id','sla_met_count'],['COUNT','ticket_id','ticket_count']],
    tables: ['tickets'], dims: ['category'],
  },
  ar_aging: {
    kpis: [['AVG','days_overdue','days_overdue'],['SUM','invoice_amount','invoice_amount'],['SUM','outstanding_bal','outstanding_balance'],['SUM','paid_amount','paid_amount']],
    tables: ['customers','invoices'], dims: ['customer_name'],
  },
  monthly_revenue: {
    kpis: [['AVG','order_value','avg_order_value'],['COUNT','customer_id','customer_count'],['SUM','gross_rev','gross_revenue'],['SUM','net_rev','net_revenue'],['COUNT','order_id','order_count']],
    tables: ['orders','order_items','product_master'], dims: ['product_category','revenue_month'],
  },
  headcount: {
    kpis: [['AVG','tenure_years','avg_tenure_years'],['COUNT','employee_id','headcount']],
    tables: ['departments','employees'], dims: ['department_name','employment_type'],
  },
  campaign_roi: {
    kpis: [['SUM','expense_amount','actual_spend'],['SUM','budget_amount','budget_amount'],['COUNT','customer_id','customers_acquired'],['SUM','attributed_rev','revenue_generated']],
    tables: ['campaigns','campaign_expenses','attribution'], dims: ['campaign_name'],
  },
  inventory_turnover: {
    kpis: [['AVG','inventory_value','avg_inventory_value'],['SUM','cogs','cogs_amount']],
    tables: ['inventory_snapshots','shipments','shipment_items','product_master'], dims: ['product_category'],
  },
  supplier_lead: {
    kpis: [['AVG','lead_time_days','avg_lead_time_days'],['MAX','lead_time','max_lead_time'],['MIN','lead_time_min','min_lead_time'],['COUNT','order_id','order_count']],
    tables: ['goods_receipts','purchase_orders','suppliers'], dims: ['supplier_name'],
  },
  dau: {
    kpis: [['COUNT','user_id','dau'],['COUNT','session_id','session_count']],
    tables: ['usage_logs'], dims: ['activity_date'],
  },
  pipeline_funnel: {
    kpis: [['AVG','probability','avg_probability'],['COUNT','opp_id','opportunities_entered'],['SUM','pipeline_amount','pipeline_value']],
    tables: ['opportunities'], dims: ['stage_name'],
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// SOURCE REPORTS
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n=== Writing SOURCE reports ===');

// src-excel-01  CSAT_Score_Monitoring  (Consolidate ~84% vs Feedback_Sentiment_Ratings)
writeReport('source','src-excel-01-csat-score-monitoring',
  {id:'src-excel-01',name:'CSAT Score Monitoring',domain:'Customer Service',owner:'Support Analytics',usageFrequency:34,
   description:'Tracks customer satisfaction scores collected from post-ticket surveys across support categories. Monitors positive and negative response counts to surface service quality trends.'},
  'csat_score_monitoring',
  makeSql('CSAT Score Monitoring',
    [['AVG','satisfaction_score','avg_csat'],['COUNT','negative_id','negative_count'],
     ['COUNT','positive_id','positive_count'],['COUNT','response_id','response_count'],
     ['AVG','satisfaction_rate','satisfaction_rate']],  // extra KPI → forces Consolidate
    ['csat_surveys','tickets'],['category']));

// src-excel-02  Escalation_Rate_Report  (Migrate 17% vs Case_Handling_KPIs)
writeReport('source','src-excel-02-escalation-rate-report',
  {id:'src-excel-02',name:'Escalation Rate Report',domain:'Customer Service',owner:'Support Analytics',usageFrequency:22,
   description:'Captures tickets that were escalated along with the reason and time-to-escalate. Helps identify recurring escalation drivers.'},
  'escalation_rate_report',
  makeSql('Escalation Rate Report',
    [['AVG','hours_to_escalate','avg_hours_to_escalate'],['COUNT','escalation_id','escalation_count']],
    ['escalations','tickets'],['escalation_reason']));

// src-excel-03  Self_Service_Usage  (Migrate 14% vs Customer_Voice_Topics_V3)
writeReport('source','src-excel-03-self-service-usage',
  {id:'src-excel-03',name:'Self Service Usage',domain:'Customer Service',owner:'Support Analytics',usageFrequency:18,
   description:'Measures knowledge base article engagement and whether customers still ended up filing a ticket. Highlights content effectiveness via deflection rates.'},
  'self_service_usage',
  makeSql('Self Service Usage',
    [['COUNT','view_id','article_views'],['AVG','time_on_page','avg_time_on_page'],['COUNT','deflected_id','deflected_views']],
    ['kb_views','knowledge_base'],['category']));

// src-excel-04  Ticket_Resolution_Dashboard  (Rationalize 100% vs Case_Handling_KPIs)
writeReport('source','src-excel-04-ticket-resolution-dashboard',
  {id:'src-excel-04',name:'Ticket Resolution Dashboard',domain:'Customer Service',owner:'Support Leadership',usageFrequency:62,
   description:'Summarizes ticket volumes, resolution times, and SLA attainment by category. Used by support leadership to monitor team throughput and service-level compliance.'},
  'ticket_resolution_dashboard',
  makeSql('Ticket Resolution Dashboard', R.ticket_resolution.kpis, R.ticket_resolution.tables, R.ticket_resolution.dims));

// src-excel-05  AP_Aging_Summary  (Migrate 0% vs Supplier_Payables_Aging)
writeReport('source','src-excel-05-ap-aging-summary',
  {id:'src-excel-05',name:'AP Aging Summary',domain:'Finance',owner:'Accounts Payable',usageFrequency:41,
   description:'Breaks down open vendor bills into aging buckets based on due date. Highlights outstanding balances by payment terms to support cash management.'},
  'ap_aging_summary',
  makeSql('AP Aging Summary',
    [['SUM','days_1_30_amt','days_1_30'],['SUM','days_31_60_amt','days_31_60'],['SUM','days_60plus_amt','days_60_plus'],['COUNT','bill_id','open_bills'],['SUM','outstanding','total_outstanding']],
    ['vendor_bills','vendors'],['vendor_name','payment_terms']));

// src-excel-06  AR_Aging_Report  (Rationalize 100% vs Open_Receivables_View)
writeReport('source','src-excel-06-ar-aging-report',
  {id:'src-excel-06',name:'AR Aging Report',domain:'Finance',owner:'Collections',usageFrequency:55,
   description:'Tracks outstanding customer invoices and days overdue against due dates. Used by collections and finance teams to manage receivables and assess credit exposure.'},
  'ar_aging_report',
  makeSql('AR Aging Report', R.ar_aging.kpis, R.ar_aging.tables, R.ar_aging.dims));

// src-excel-07  Cash_Flow_Forecast  (Migrate 0% vs Treasury_Liquidity_Snapshot)
writeReport('source','src-excel-07-cash-flow-forecast',
  {id:'src-excel-07',name:'Cash Flow Forecast',domain:'Finance',owner:'Treasury',usageFrequency:29,
   description:'Projects weekly cash inflows, outflows, and net position from multiple forecast sources. Enables treasury to anticipate liquidity needs.'},
  'cash_flow_forecast',
  makeSql('Cash Flow Forecast',
    [['SUM','projected_inflow','projected_inflow'],['SUM','projected_outflow','projected_outflow'],['SUM','net_cash','net_cash_flow'],['AVG','opening_balance','opening_balance']],
    ['cash_forecasts'],['forecast_source','forecast_week']));

// src-excel-08  Expense_Reimbursement_Summary  (Migrate 0% vs Cost_Allocation_Audit)
writeReport('source','src-excel-08-expense-reimbursement-summary',
  {id:'src-excel-08',name:'Expense Reimbursement Summary',domain:'Finance',owner:'Finance Ops',usageFrequency:24,
   description:'Aggregates employee expense reports by category and month with approved amounts. Supports policy oversight and trend analysis for travel and operational spending.'},
  'expense_reimbursement_summary',
  makeSql('Expense Reimbursement Summary',
    [['AVG','approved_amt','avg_reimbursement'],['COUNT','report_id','report_count'],['SUM','total_approved','total_approved']],
    ['expense_reports'],['expense_category','expense_month']));

// src-excel-09  FX_Hedging_Position  (Migrate 0% vs Cost_Allocation_Audit_V2)
writeReport('source','src-excel-09-fx-hedging-position',
  {id:'src-excel-09',name:'FX Hedging Position',domain:'Finance',owner:'Treasury Risk',usageFrequency:17,
   description:'Reports outstanding foreign exchange hedges by currency pair and hedge type. Provides notional exposure and unrealized P&L for treasury risk management.'},
  'fx_hedging_position',
  makeSql('FX Hedging Position',
    [['AVG','hedge_rate','avg_hedge_rate'],['SUM','notional_amount','total_notional'],['SUM','unrealized_pnl','unrealized_pnl']],
    ['hedge_positions'],['currency_pair','hedge_type']));

// src-excel-10  Monthly_Revenue_Dashboard  (Rationalize 100% vs Revenue_Trend_Analytics)
writeReport('source','src-excel-10-monthly-revenue-dashboard',
  {id:'src-excel-10',name:'Monthly Revenue Dashboard',domain:'Finance',owner:'Revenue Operations',usageFrequency:78,
   description:'Consolidates monthly gross and net revenue by product category with customer and order counts. Core report for finance and commercial leadership to track top-line performance.'},
  'monthly_revenue_dashboard',
  makeSql('Monthly Revenue Dashboard', R.monthly_revenue.kpis, R.monthly_revenue.tables, R.monthly_revenue.dims));

// src-excel-11  Quarterly_Revenue_By_Region  (Consolidate ~80% vs Geographic_Sales_Summary)
writeReport('source','src-excel-11-quarterly-revenue-by-region',
  {id:'src-excel-11',name:'Quarterly Revenue By Region',domain:'Finance',owner:'Regional Sales',usageFrequency:44,
   description:'Summarizes quarterly revenue and order activity segmented by geographic region. Used to evaluate regional performance and guide territory-level planning.'},
  'quarterly_revenue_by_region',
  makeSql('Quarterly Revenue By Region',
    [['AVG','order_value','avg_order_value'],['SUM','gross_rev','gross_revenue'],['SUM','net_rev','net_revenue'],['COUNT','order_id','order_count']],
    ['orders','order_items','customers','regions'],['region_name','revenue_quarter']));

// src-excel-12  Attrition_Trend_Analysis  (Consolidate ~80% vs Staff_Departure_Patterns)
writeReport('source','src-excel-12-attrition-trend-analysis',
  {id:'src-excel-12',name:'Attrition Trend Analysis',domain:'Human Resources',owner:'HR Analytics',usageFrequency:36,
   description:'Analyzes employee terminations by department, reason, and tenure at exit. Enables HR to identify attrition hotspots and understand drivers of turnover.'},
  'attrition_trend_analysis',
  makeSql('Attrition Trend Analysis',
    [['AVG','tenure_at_exit','avg_tenure_at_exit'],['AVG','tenure_months','avg_tenure_months'],['COUNT','termination_id','terminations'],['COUNT','voluntary_id','voluntary_count']],
    ['departments','employees'],['department_name','termination_reason']));

// src-excel-13  Employee_Headcount_Snapshot  (Rationalize 100% vs Workforce_Composition_View)
writeReport('source','src-excel-13-employee-headcount-snapshot',
  {id:'src-excel-13',name:'Employee Headcount Snapshot',domain:'Human Resources',owner:'Workforce Planning',usageFrequency:58,
   description:'Point-in-time headcount view across departments and employment types with average tenure. Used for workforce planning, org reporting, and budget reconciliation.'},
  'employee_headcount_snapshot',
  makeSql('Employee Headcount Snapshot', R.headcount.kpis, R.headcount.tables, R.headcount.dims));

// src-excel-14  Internal_Mobility_Tracker  (Migrate 29% vs Staff_Departure_Patterns)
writeReport('source','src-excel-14-internal-mobility-tracker',
  {id:'src-excel-14',name:'Internal Mobility Tracker',domain:'Human Resources',owner:'Talent Management',usageFrequency:21,
   description:'Tracks internal employee moves including promotions, transfers, and role changes. Supports talent mobility analytics and visibility into career progression patterns.'},
  'internal_mobility_tracker',
  makeSql('Internal Mobility Tracker',
    [['AVG','tenure_at_move','avg_tenure_at_move'],['COUNT','move_id','move_count']],
    ['employee_movements','employees'],['from_department','move_type','to_department']));

// src-excel-15  Training_Compliance_Dashboard  (Migrate 14% vs Benefits_Enrollment_Stats)
writeReport('source','src-excel-15-training-compliance-dashboard',
  {id:'src-excel-15',name:'Training Compliance Dashboard',domain:'Human Resources',owner:'L&D Compliance',usageFrequency:33,
   description:'Measures enrollment and completion of training courses, particularly mandatory programs. Helps HR and compliance track completion rates.'},
  'training_compliance_dashboard',
  makeSql('Training Compliance Dashboard',
    [['AVG','days_to_complete','avg_days_to_complete'],['COUNT','completed_id','completed_count'],['COUNT','enrolled_id','enrolled_count']],
    ['training_courses','training_enrollments'],['course_name','is_mandatory']));

// src-excel-16  Cloud_Spend_Rollup  (Migrate 0% vs Patch_Compliance_Rate)
writeReport('source','src-excel-16-cloud-spend-rollup',
  {id:'src-excel-16',name:'Cloud Spend Rollup',domain:'IT',owner:'FinOps',usageFrequency:27,
   description:'Rolls up monthly cloud costs by provider and service for IT FinOps review. Surfaces usage and cost trends to support budget control and vendor optimization.'},
  'cloud_spend_rollup',
  makeSql('Cloud Spend Rollup',
    [['SUM','cost_amount','total_cost'],['SUM','usage_amount','total_usage']],
    ['cloud_costs'],['cloud_provider','service_name','billing_month']));

// src-excel-17  Server_Performance_Dashboard  (Migrate 0% vs Network_Bandwidth_Usage)
writeReport('source','src-excel-17-server-performance-dashboard',
  {id:'src-excel-17',name:'Server Performance Dashboard',domain:'IT',owner:'Infrastructure',usageFrequency:39,
   description:'Monitors CPU, memory utilization, and downtime across production and non-production servers. Used by infrastructure teams to identify capacity issues.'},
  'server_performance_dashboard',
  makeSql('Server Performance Dashboard',
    [['AVG','cpu_pct','avg_cpu'],['AVG','memory_pct','avg_memory'],['SUM','downtime_min','total_downtime_minutes']],
    ['server_monitoring','servers'],['server_name','environment']));

// src-excel-18  Brand_Awareness_Index  (Migrate 0% vs Social_Sentiment_Dashboard)
writeReport('source','src-excel-18-brand-awareness-index',
  {id:'src-excel-18',name:'Brand Awareness Index',domain:'Marketing',owner:'Brand Strategy',usageFrequency:19,
   description:'Aggregates aided and unaided brand awareness scores from survey responses. Segmented by demographic and region to inform brand strategy and campaign targeting.'},
  'brand_awareness_index',
  makeSql('Brand Awareness Index',
    [['AVG','aided_score','avg_aided_awareness'],['AVG','unaided_score','avg_unaided_awareness'],['COUNT','respondent_id','total_respondents']],
    ['brand_surveys','survey_responses'],['demographic_segment','region']));

// src-excel-19  Campaign_ROI_Analysis  (Rationalize 100% vs Promotional_Spend_Effectiveness)
writeReport('source','src-excel-19-campaign-roi-analysis',
  {id:'src-excel-19',name:'Campaign ROI Analysis',domain:'Marketing',owner:'Marketing Analytics',usageFrequency:47,
   description:'Compares campaign spend against attributed revenue and customers acquired. Enables marketing leadership to evaluate return on investment and reallocate budget.'},
  'campaign_roi_analysis',
  makeSql('Campaign ROI Analysis', R.campaign_roi.kpis, R.campaign_roi.tables, R.campaign_roi.dims));

// src-excel-20  Email_Campaign_Performance  (Consolidate ~84% vs Mailer_Engagement_Stats)
writeReport('source','src-excel-20-email-campaign-performance',
  {id:'src-excel-20',name:'Email Campaign Performance',domain:'Marketing',owner:'CRM Marketing',usageFrequency:38,
   description:'Tracks email campaign engagement including sends, opens, clicks, bounces, and unsubscribes. Used by CRM and lifecycle marketing teams to evaluate creative and list quality.'},
  'email_campaign_performance',
  makeSql('Email Campaign Performance',
    [['COUNT','bounce_id','bounces'],['COUNT','click_id','total_clicks'],['COUNT','open_id','total_opens'],['COUNT','send_id','total_sent'],['COUNT','unsub_id','unsubscribes']],
    ['email_campaigns','email_events'],['campaign_name']));

// src-excel-21  Lead_Funnel_Metrics  (Migrate 0% vs Prospect_Conversion_View)
writeReport('source','src-excel-21-lead-funnel-metrics',
  {id:'src-excel-21',name:'Lead Funnel Metrics',domain:'Marketing',owner:'Demand Gen',usageFrequency:31,
   description:'Tracks lead volume, qualification, and conversion to opportunities by source. Helps demand generation teams evaluate lead quality and source-level efficiency.'},
  'lead_funnel_metrics',
  makeSql('Lead Funnel Metrics',
    [['COUNT','converted_id','converted_leads'],['COUNT','qualified_id','qualified_leads'],['COUNT','lead_id','total_leads']],
    ['leads'],['lead_source']));

// src-excel-22  SEO_Keyword_Rankings  (Migrate 11% vs Mailer_Engagement_Stats)
writeReport('source','src-excel-22-seo-keyword-rankings',
  {id:'src-excel-22',name:'SEO Keyword Rankings',domain:'Marketing',owner:'SEO Team',usageFrequency:23,
   description:'Reports search position, impressions, and clicks for tracked keywords. Guides SEO strategy by highlighting ranking trends and organic traffic drivers.'},
  'seo_keyword_rankings',
  makeSql('SEO Keyword Rankings',
    [['AVG','search_position','avg_position'],['COUNT','click_id','total_clicks'],['COUNT','impression_id','total_impressions']],
    ['keyword_rankings','keywords'],['keyword_text']));

// src-excel-23  Fleet_Utilization_Report  (Migrate 0% vs Distribution_Network_Map_V2)
writeReport('source','src-excel-23-fleet-utilization-report',
  {id:'src-excel-23',name:'Fleet Utilization Report',domain:'Operations',owner:'Logistics Ops',usageFrequency:26,
   description:'Summarizes monthly vehicle utilization, mileage, and fleet size by home depot and vehicle type. Used by logistics to optimize asset deployment.'},
  'fleet_utilization_report',
  makeSql('Fleet Utilization Report',
    [['AVG','utilization_pct','avg_utilization_pct'],['COUNT','vehicle_id','fleet_size'],['SUM','miles_driven','total_miles']],
    ['fleet_logs','vehicles'],['home_depot','vehicle_type']));

// src-excel-24  Inventory_Turnover_Report  (Rationalize 100% vs Stock_Movement_Ratio)
writeReport('source','src-excel-24-inventory-turnover-report',
  {id:'src-excel-24',name:'Inventory Turnover Report',domain:'Operations',owner:'Supply Chain',usageFrequency:43,
   description:'Calculates inventory value and cost of goods sold by product category. Used to assess stock efficiency and identify slow-moving or overstocked categories.'},
  'inventory_turnover_report',
  makeSql('Inventory Turnover Report', R.inventory_turnover.kpis, R.inventory_turnover.tables, R.inventory_turnover.dims));

// src-excel-25  Manufacturing_Yield_Dashboard  (Consolidate ~80% vs Production_Line_Quality)
writeReport('source','src-excel-25-manufacturing-yield-dashboard',
  {id:'src-excel-25',name:'Manufacturing Yield Dashboard',domain:'Operations',owner:'Manufacturing Ops',usageFrequency:35,
   description:'Reports input, output, and scrap quantities by plant and product category. Supports manufacturing teams in tracking yield rates and identifying process waste.'},
  'manufacturing_yield_dashboard',
  makeSql('Manufacturing Yield Dashboard',
    [['SUM','input_qty','total_input'],['SUM','output_qty','total_output'],['SUM','scrap_qty','total_scrap'],['AVG','scrap_rate','scrap_rate']],
    ['plants','production_orders','product_master'],['plant_name','product_category']));

// src-excel-26  Production_Shift_Output  (Migrate 22% vs Production_Line_Quality)
writeReport('source','src-excel-26-production-shift-output',
  {id:'src-excel-26',name:'Production Shift Output',domain:'Operations',owner:'Plant Management',usageFrequency:29,
   description:'Captures units produced and downtime by plant and shift. Enables operations leaders to compare shift productivity and investigate downtime patterns.'},
  'production_shift_output',
  makeSql('Production Shift Output',
    [['AVG','downtime_min','avg_downtime'],['SUM','units_produced','shift_output']],
    ['plants','production_logs','shifts'],['plant_name','shift_name','prod_date']));

// src-excel-27  Supplier_Lead_Time_Report  (Rationalize 100% vs Vendor_Delivery_Timings)
writeReport('source','src-excel-27-supplier-lead-time-report',
  {id:'src-excel-27',name:'Supplier Lead Time Report',domain:'Operations',owner:'Procurement',usageFrequency:37,
   description:'Measures supplier lead times from purchase order to goods receipt. Highlights reliability across suppliers and supports procurement planning and SLA discussions.'},
  'supplier_lead_time_report',
  makeSql('Supplier Lead Time Report', R.supplier_lead.kpis, R.supplier_lead.tables, R.supplier_lead.dims));

// src-excel-28  Daily_Active_Users_Report  (Rationalize 100% vs Platform_Engagement_Daily)
writeReport('source','src-excel-28-daily-active-users-report',
  {id:'src-excel-28',name:'Daily Active Users Report',domain:'Product',owner:'Growth Analytics',usageFrequency:71,
   description:'Tracks daily active users and session counts based on product usage logs. Core engagement metric used by product and growth teams to monitor adoption.'},
  'daily_active_users_report',
  makeSql('Daily Active Users Report', R.dau.kpis, R.dau.tables, R.dau.dims));

// src-excel-29  Feature_Adoption_Metrics  (Migrate ~68% vs Capability_Uptake_Analytics)
writeReport('source','src-excel-29-feature-adoption-metrics',
  {id:'src-excel-29',name:'Feature Adoption Metrics',domain:'Product',owner:'Product Analytics',usageFrequency:32,
   description:'Measures how many eligible users tried each feature and how many returned. Helps product managers evaluate feature stickiness and rollout success.'},
  'feature_adoption_metrics',
  makeSql('Feature Adoption Metrics',
    [['COUNT','repeat_user_id','repeat_users'],['COUNT','eligible_user_id','total_eligible_users'],['COUNT','tried_user_id','users_who_tried'],['AVG','adoption_rate','feature_adoption_rate'],['AVG','reach_pct','feature_reach_pct']],
    ['feature_usage','features','users'],['feature_name']));

// src-excel-30  Release_Stability_Report  (Migrate 0% vs Capability_Uptake_Analytics)
writeReport('source','src-excel-30-release-stability-report',
  {id:'src-excel-30',name:'Release Stability Report',domain:'Product',owner:'Engineering QA',usageFrequency:28,
   description:'Reports crash counts and crash-free session rates by release. Used by engineering and QA to monitor release health and prioritize hotfixes.'},
  'release_stability_report',
  makeSql('Release Stability Report',
    [['COUNT','crash_id','crash_count'],['AVG','crash_free_pct','crash_free_pct'],['COUNT','session_id','total_sessions']],
    ['releases','sessions'],['release_name']));

// src-excel-31  Session_Heatmap  (Migrate 14% vs Platform_Engagement_Daily)
writeReport('source','src-excel-31-session-heatmap',
  {id:'src-excel-31',name:'Session Heatmap',domain:'Product',owner:'Product Analytics',usageFrequency:22,
   description:'Aggregates session counts and durations by app version and platform. Used to understand usage patterns across device types and diagnose version-specific issues.'},
  'session_heatmap',
  makeSql('Session Heatmap',
    [['AVG','duration_sec','avg_duration'],['AVG','median_duration_sec','median_duration'],['COUNT','session_id','session_count']],
    ['sessions'],['app_version','platform']));

// src-excel-32  AML_Alert_Volumes  (Migrate 0% vs Audit_Finding_Register)
writeReport('source','src-excel-32-aml-alert-volumes',
  {id:'src-excel-32',name:'AML Alert Volumes',domain:'Risk',owner:'Compliance',usageFrequency:25,
   description:'Summarizes weekly AML rule hits and flagged transaction amounts. Supports compliance monitoring by rule, flagging high-volume or high-value alert patterns.'},
  'aml_alert_volumes',
  makeSql('AML Alert Volumes',
    [['COUNT','hit_id','alert_count'],['SUM','transaction_amount','flagged_amount']],
    ['aml_rule_hits','aml_rules','transactions'],['rule_name','alert_week']));

// src-excel-33  Credit_Risk_Scoring  (Consolidate ~80% vs Debtor_Exposure_Rating)
writeReport('source','src-excel-33-credit-risk-scoring',
  {id:'src-excel-33',name:'Credit Risk Scoring',domain:'Risk',owner:'Credit Risk',usageFrequency:41,
   description:'Combines customer credit rating, limits, AR exposure, and payment behavior. Used by finance and risk to monitor credit-worthiness and manage exposure limits.'},
  'credit_risk_scoring',
  makeSql('Credit Risk Scoring',
    [['AVG','days_late','avg_days_late'],['SUM','credit_limit','credit_limit'],['SUM','ar_exposure','current_ar_exposure'],['AVG','credit_score','credit_score']],
    ['customers','invoices'],['customer_name','credit_rating']));

// src-excel-34  Regulatory_Filing_Tracker  (Migrate 0% vs Vendor_Security_Posture)
writeReport('source','src-excel-34-regulatory-filing-tracker',
  {id:'src-excel-34',name:'Regulatory Filing Tracker',domain:'Risk',owner:'Tax Compliance',usageFrequency:19,
   description:'Tracks tax filings by jurisdiction with calculated liabilities, payments, and due dates. Supports tax and compliance teams in meeting filing deadlines.'},
  'regulatory_filing_tracker',
  makeSql('Regulatory Filing Tracker',
    [['SUM','calculated_liability','calculated_liability'],['SUM','outstanding_amt','outstanding'],['SUM','paid_amount','paid_amount']],
    ['tax_liabilities'],['jurisdiction','tax_type','filing_due_date']));

// src-excel-35  Cross_Sell_Basket_Analysis  (Migrate 0% vs Distributor_Scorecard)
writeReport('source','src-excel-35-cross-sell-basket-analysis',
  {id:'src-excel-35',name:'Cross Sell Basket Analysis',domain:'Sales',owner:'Merchandising',usageFrequency:23,
   description:'Identifies pairs of products frequently purchased together in the same order. Used by merchandising and sales to drive cross-sell strategy and bundle offers.'},
  'cross_sell_basket_analysis',
  makeSql('Cross Sell Basket Analysis',
    [['COUNT','co_occurrence_id','co_occurrence_count'],['SUM','cross_sell_rev','cross_sell_revenue']],
    ['product_master','order_items'],['anchor_product','cross_sell_product']));

// src-excel-36  Customer_Lifetime_Value_Report  (Migrate 10% vs Distributor_Scorecard)
writeReport('source','src-excel-36-customer-lifetime-value-report',
  {id:'src-excel-36',name:'Customer Lifetime Value Report',domain:'Sales',owner:'Sales Analytics',usageFrequency:38,
   description:'Calculates lifetime value, order history, and recency for each customer. Used by sales and marketing to segment customers and prioritize retention efforts.'},
  'customer_lifetime_value_report',
  makeSql('Customer Lifetime Value Report',
    [['AVG','order_value','avg_order_value'],['COUNT','order_id','order_count'],['SUM','lifetime_val','lifetime_value']],
    ['customers','orders','order_items'],['customer_name','first_order_date','last_order_date']));

// src-excel-37  Deal_Stage_Velocity  (Migrate 14% vs Stage_By_Stage_Deal_Flow)
writeReport('source','src-excel-37-deal-stage-velocity',
  {id:'src-excel-37',name:'Deal Stage Velocity',domain:'Sales',owner:'Sales Ops',usageFrequency:31,
   description:'Measures time opportunities spend in each sales stage and aggregate pipeline value. Helps sales operations identify bottlenecks and forecast deal progression.'},
  'deal_stage_velocity',
  makeSql('Deal Stage Velocity',
    [['SUM','pipeline_amount','aggregate_pipeline'],['AVG','days_in_stage','avg_days_in_stage'],['COUNT','opp_id','opportunity_count']],
    ['opportunity_history'],['stage_name']));

// src-excel-38  Pipeline_Conversion_Funnel  (Rationalize 100% vs Stage_By_Stage_Deal_Flow)
writeReport('source','src-excel-38-pipeline-conversion-funnel',
  {id:'src-excel-38',name:'Pipeline Conversion Funnel',domain:'Sales',owner:'Sales Leadership',usageFrequency:63,
   description:'Shows opportunity counts, pipeline value, and probability at each stage. Standard funnel view used by sales leadership for forecasting and stage-level conversion analysis.'},
  'pipeline_conversion_funnel',
  makeSql('Pipeline Conversion Funnel', R.pipeline_funnel.kpis, R.pipeline_funnel.tables, R.pipeline_funnel.dims));

// src-excel-39  Quote_To_Close_Ratio  (Migrate 11% vs Seller_Achievement_Rollup)
writeReport('source','src-excel-39-quote-to-close-ratio',
  {id:'src-excel-39',name:'Quote To Close Ratio',domain:'Sales',owner:'Sales Enablement',usageFrequency:27,
   description:'Tracks quotes issued versus quotes won by sales rep with close-rate percentage. Used to evaluate rep effectiveness at converting quoted opportunities.'},
  'quote_to_close_ratio',
  makeSql('Quote To Close Ratio',
    [['AVG','close_rate','close_rate_pct'],['COUNT','quote_id','quotes_issued'],['COUNT','won_id','quotes_won']],
    ['quotes','sales_reps'],['rep_name']));

// src-excel-40  Sales_Rep_Performance  (Migrate 57% vs Seller_Achievement_Rollup)
writeReport('source','src-excel-40-sales-rep-performance',
  {id:'src-excel-40',name:'Sales Rep Performance',domain:'Sales',owner:'Sales Leadership',usageFrequency:66,
   description:'Combines booked revenue, deals closed, unique customers, and quota by rep. Primary scorecard for sales leadership to measure rep attainment and productivity.'},
  'sales_rep_performance',
  makeSql('Sales Rep Performance',
    [['SUM','booked_rev','booked_revenue'],['COUNT','deal_id','deals_closed'],['SUM','quota_amt','quota_amount'],['COUNT','customer_id','unique_customers']],
    ['orders','order_items','sales_reps'],['rep_name']));

// ──────────────────────────────────────────────────────────────────────────────
// TARGET REPORTS
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n=== Writing TARGET reports ===');

// tgt-excel-01  Case_Handling_KPIs  (Rationalize target for src-04)
writeReport('target','tgt-excel-01-case-handling-kpis',
  {id:'tgt-excel-01',name:'Case Handling KPIs',domain:'Customer Service',owner:'Support Platform',usageFrequency:0,
   description:'Tracks support ticket handling performance across categories. Measures resolution speed and SLA adherence to gauge service team effectiveness.'},
  'case_handling_kpis',
  makeSql('Case Handling KPIs', R.ticket_resolution.kpis, R.ticket_resolution.tables, R.ticket_resolution.dims));

// tgt-excel-02  Customer_Voice_Topics_V3  (Migrate target for src-03)
writeReport('target','tgt-excel-02-customer-voice-topics-v3',
  {id:'tgt-excel-02',name:'Customer Voice Topics V3',domain:'Customer Service',owner:'CX Analytics',usageFrequency:0,
   description:'Aggregates customer feedback mentions by topic and sentiment category. Surfaces recurring themes and sentiment patterns from voice analytics data.'},
  'customer_voice_topics_v3',
  makeSql('Customer Voice Topics V3',
    [['AVG','sentiment_score','avg_sentiment'],['COUNT','mention_id','mention_count']],
    ['voice_analytics'],['sentiment_category','topic_name']));

// tgt-excel-03  Feedback_Sentiment_Ratings  (Consolidate target for src-01)
writeReport('target','tgt-excel-03-feedback-sentiment-ratings',
  {id:'tgt-excel-03',name:'Feedback Sentiment Ratings',domain:'Customer Service',owner:'Support Platform',usageFrequency:0,
   description:'Combines CSAT survey scores with ticket categories to quantify customer satisfaction. Breaks down positive and negative response counts by support category.'},
  'feedback_sentiment_ratings',
  makeSql('Feedback Sentiment Ratings',
    [['AVG','satisfaction_score','avg_csat'],['COUNT','negative_id','negative_count'],
     ['COUNT','positive_id','positive_count'],['AVG','positive_pct','positive_pct'],
     ['COUNT','response_id','response_count']],
    ['csat_surveys','tickets'],['category']));

// tgt-excel-04  Open_Receivables_View  (Rationalize target for src-06)
writeReport('target','tgt-excel-04-open-receivables-view',
  {id:'tgt-excel-04',name:'Open Receivables View',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Lists unpaid customer invoices with aging details. Tracks outstanding balances and days overdue to support collections activity.'},
  'open_receivables_view',
  makeSql('Open Receivables View', R.ar_aging.kpis, R.ar_aging.tables, R.ar_aging.dims));

// tgt-excel-05  Supplier_Payables_Aging  (Migrate target for src-05)
writeReport('target','tgt-excel-05-supplier-payables-aging',
  {id:'tgt-excel-05',name:'Supplier Payables Aging',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Ages outstanding supplier payables to support cash management and vendor payment prioritization.'},
  'supplier_payables_aging',
  makeSql('Supplier Payables Aging',
    [['SUM','overdue_30','overdue_30_days'],['SUM','overdue_60','overdue_60_days'],['SUM','total_payable','total_payables'],['COUNT','vendor_id','vendor_count']],
    ['accounts_payable','vendors'],['vendor_name','payment_terms']));

// tgt-excel-06  Treasury_Liquidity_Snapshot  (Migrate target for src-07)
writeReport('target','tgt-excel-06-treasury-liquidity-snapshot',
  {id:'tgt-excel-06',name:'Treasury Liquidity Snapshot',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Point-in-time snapshot of bank account balances and interest earned. Supports treasury monitoring of liquidity positions across account types.'},
  'treasury_liquidity_snapshot',
  makeSql('Treasury Liquidity Snapshot',
    [['AVG','days_held','avg_days_held'],['SUM','closing_balance','closing_balance'],['SUM','interest_earned','interest_earned']],
    ['bank_accounts'],['account_type']));

// tgt-excel-07  Cost_Allocation_Audit  (Migrate target for src-08)
writeReport('target','tgt-excel-07-cost-allocation-audit',
  {id:'tgt-excel-07',name:'Cost Allocation Audit',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Audits cost allocation entries across cost centers and GL accounts. Summarizes allocation frequency and total amounts for financial review.'},
  'cost_allocation_audit',
  makeSql('Cost Allocation Audit',
    [['SUM','allocated_amount','allocated_total'],['COUNT','allocation_id','allocation_events']],
    ['cost_allocations','cost_centers','gl_accounts'],['account_name','cost_center_name']));

// tgt-excel-08  Cost_Allocation_Audit_V2  (Migrate target for src-09)
writeReport('target','tgt-excel-08-cost-allocation-audit-v2',
  {id:'tgt-excel-08',name:'Cost Allocation Audit V2',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Version 2 of the cost allocation audit. Provides the same cost center and account-level aggregation for comparison runs.'},
  'cost_allocation_audit_v2',
  makeSql('Cost Allocation Audit V2',
    [['SUM','allocated_amount','allocated_total'],['COUNT','allocation_id','allocation_events']],
    ['cost_allocations','cost_centers','gl_accounts'],['account_name','cost_center_name']));

// tgt-excel-09  Revenue_Trend_Analytics  (Rationalize target for src-10)
writeReport('target','tgt-excel-09-revenue-trend-analytics',
  {id:'tgt-excel-09',name:'Revenue Trend Analytics',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Monthly revenue trend analysis segmented by product category. Tracks order volume, customer counts, and average order value to identify growth drivers.'},
  'revenue_trend_analytics',
  makeSql('Revenue Trend Analytics', R.monthly_revenue.kpis, R.monthly_revenue.tables, R.monthly_revenue.dims));

// tgt-excel-10  Geographic_Sales_Summary  (Consolidate target for src-11)
writeReport('target','tgt-excel-10-geographic-sales-summary',
  {id:'tgt-excel-10',name:'Geographic Sales Summary',domain:'Finance',owner:'Finance Platform',usageFrequency:0,
   description:'Summarizes sales performance by geographic region on a quarterly basis. Captures gross and net revenue with discount impact for regional comparison.'},
  'geographic_sales_summary',
  makeSql('Geographic Sales Summary',
    [['SUM','gross_rev','gross_revenue'],['SUM','net_rev','net_revenue'],['COUNT','order_id','order_count'],['SUM','total_disc','total_discount']],
    ['orders','order_items','customers','regions'],['region_name','revenue_quarter']));

// tgt-excel-11  Staff_Departure_Patterns  (Consolidate target for src-12; Migrate for src-14)
writeReport('target','tgt-excel-11-staff-departure-patterns',
  {id:'tgt-excel-11',name:'Staff Departure Patterns',domain:'Human Resources',owner:'HR Platform',usageFrequency:0,
   description:'Analyzes employee terminations by department and reason. Captures tenure at exit and voluntary vs involuntary splits to identify attrition patterns.'},
  'staff_departure_patterns',
  makeSql('Staff Departure Patterns',
    [['AVG','tenure_at_exit','avg_tenure_at_exit'],['COUNT','termination_id','terminations'],['COUNT','voluntary_id','voluntary_count'],['AVG','voluntary_pct','voluntary_pct']],
    ['departments','employees'],['department_name','termination_reason']));

// tgt-excel-12  Workforce_Composition_View  (Rationalize target for src-13)
writeReport('target','tgt-excel-12-workforce-composition-view',
  {id:'tgt-excel-12',name:'Workforce Composition View',domain:'Human Resources',owner:'HR Platform',usageFrequency:0,
   description:'Headcount and tenure breakdown by department and employment type. Provides the standard workforce composition snapshot for HR reporting.'},
  'workforce_composition_view',
  makeSql('Workforce Composition View', R.headcount.kpis, R.headcount.tables, R.headcount.dims));

// tgt-excel-13  Benefits_Enrollment_Stats  (Migrate target for src-15)
writeReport('target','tgt-excel-13-benefits-enrollment-stats',
  {id:'tgt-excel-13',name:'Benefits Enrollment Stats',domain:'Human Resources',owner:'HR Platform',usageFrequency:0,
   description:'Enrollment counts and premium averages across benefit plans. Helps HR evaluate plan adoption and cost.'},
  'benefits_enrollment_stats',
  makeSql('Benefits Enrollment Stats',
    [['AVG','premium_amount','avg_premium'],['COUNT','employee_id','enrolled_count']],
    ['benefit_enrollments','benefit_plans'],['plan_name']));

// tgt-excel-14  Patch_Compliance_Rate  (Migrate target for src-16)
writeReport('target','tgt-excel-14-patch-compliance-rate',
  {id:'tgt-excel-14',name:'Patch Compliance Rate',domain:'IT',owner:'IT Security',usageFrequency:0,
   description:'Measures endpoint patch coverage by operating system. Reports compliance percentages to drive remediation prioritization.'},
  'patch_compliance_rate',
  makeSql('Patch Compliance Rate',
    [['COUNT','endpoint_id','endpoint_count'],['AVG','compliance_pct','patch_compliance_pct'],['COUNT','patched_id','patched_endpoints']],
    ['endpoints','patch_status'],['operating_system']));

// tgt-excel-15  Network_Bandwidth_Usage  (Migrate target for src-17)
writeReport('target','tgt-excel-15-network-bandwidth-usage',
  {id:'tgt-excel-15',name:'Network Bandwidth Usage',domain:'IT',owner:'Network Ops',usageFrequency:0,
   description:'Monitors average and peak network bandwidth consumption by subnet. Supports capacity planning and traffic analysis.'},
  'network_bandwidth_usage',
  makeSql('Network Bandwidth Usage',
    [['AVG','bandwidth_mbps','avg_bandwidth'],['MAX','peak_bandwidth_mbps','peak_bandwidth']],
    ['network_metrics'],['subnet_id']));

// tgt-excel-16  Social_Sentiment_Dashboard  (Migrate target for src-18)
writeReport('target','tgt-excel-16-social-sentiment-dashboard',
  {id:'tgt-excel-16',name:'Social Sentiment Dashboard',domain:'Marketing',owner:'Marketing Platform',usageFrequency:0,
   description:'Weekly social media sentiment and engagement trends by platform. Aggregates post volume, sentiment scores, and engagement counts.'},
  'social_sentiment_dashboard',
  makeSql('Social Sentiment Dashboard',
    [['AVG','sentiment_score','avg_sentiment'],['SUM','engagement_count','engagements'],['COUNT','post_id','post_count']],
    ['social_media_posts'],['platform','post_week']));

// tgt-excel-17  Promotional_Spend_Effectiveness  (Rationalize target for src-19)
writeReport('target','tgt-excel-17-promotional-spend-effectiveness',
  {id:'tgt-excel-17',name:'Promotional Spend Effectiveness',domain:'Marketing',owner:'Marketing Platform',usageFrequency:0,
   description:'Compares campaign budgets, actual spend, and attributed revenue. Measures customer acquisition efficiency across campaigns.'},
  'promotional_spend_effectiveness',
  makeSql('Promotional Spend Effectiveness', R.campaign_roi.kpis, R.campaign_roi.tables, R.campaign_roi.dims));

// tgt-excel-18  Mailer_Engagement_Stats  (Consolidate for src-20; Migrate for src-22)
writeReport('target','tgt-excel-18-mailer-engagement-stats',
  {id:'tgt-excel-18',name:'Mailer Engagement Stats',domain:'Marketing',owner:'Marketing Platform',usageFrequency:0,
   description:'Tracks email campaign engagement from sends through opens, clicks, and unsubscribes. Calculates open rates to assess campaign effectiveness.'},
  'mailer_engagement_stats',
  makeSql('Mailer Engagement Stats',
    [['AVG','open_rate_pct','open_rate'],['COUNT','click_id','total_clicks'],['COUNT','open_id','total_opens'],['COUNT','send_id','total_sent'],['COUNT','unsub_id','unsubscribes']],
    ['email_campaigns','email_events'],['campaign_name']));

// tgt-excel-19  Prospect_Conversion_View  (Migrate target for src-21)
writeReport('target','tgt-excel-19-prospect-conversion-view',
  {id:'tgt-excel-19',name:'Prospect Conversion View',domain:'Marketing',owner:'Marketing Platform',usageFrequency:0,
   description:'Tracks prospect-to-customer conversion funnel for marketing qualification.'},
  'prospect_conversion_view',
  makeSql('Prospect_Conversion_View',
    [['COUNT','prospect_id','prospect_count'],['COUNT','converted_id','converted_prospects'],['AVG','conversion_rate','conversion_rate_pct']],
    ['prospects','campaigns'],['lead_stage','channel']));

// tgt-excel-20  Distribution_Network_Map_V2  (Migrate target for src-23)
writeReport('target','tgt-excel-20-distribution-network-map-v2',
  {id:'tgt-excel-20',name:'Distribution Network Map V2',domain:'Operations',owner:'Logistics Platform',usageFrequency:0,
   description:'Maps outbound shipment activity across warehouses and regions. Tracks shipment counts and total weight moved through the distribution network.'},
  'distribution_network_map_v2',
  makeSql('Distribution Network Map V2',
    [['COUNT','shipment_id','outbound_shipments'],['SUM','weight_kg','total_weight_shipped']],
    ['warehouses','shipments'],['region','warehouse_name']));

// tgt-excel-21  Stock_Movement_Ratio  (Rationalize target for src-24)
writeReport('target','tgt-excel-21-stock-movement-ratio',
  {id:'tgt-excel-21',name:'Stock Movement Ratio',domain:'Operations',owner:'Operations Platform',usageFrequency:0,
   description:'Calculates inventory turnover via average inventory value and COGS by product category. Supports working capital and supply chain analysis.'},
  'stock_movement_ratio',
  makeSql('Stock Movement Ratio', R.inventory_turnover.kpis, R.inventory_turnover.tables, R.inventory_turnover.dims));

// tgt-excel-22  Production_Line_Quality  (Consolidate for src-25; Migrate for src-26)
writeReport('target','tgt-excel-22-production-line-quality',
  {id:'tgt-excel-22',name:'Production Line Quality',domain:'Operations',owner:'Operations Platform',usageFrequency:0,
   description:'Measures production yield, inputs, outputs, and scrap by plant and product category. Key indicator of manufacturing quality.'},
  'production_line_quality',
  makeSql('Production Line Quality',
    [['SUM','input_qty','total_input'],['SUM','output_qty','total_output'],['SUM','scrap_qty','total_scrap'],['AVG','yield_pct','yield_pct']],
    ['plants','production_orders','product_master'],['plant_name','product_category']));

// tgt-excel-23  Vendor_Delivery_Timings  (Rationalize target for src-27)
writeReport('target','tgt-excel-23-vendor-delivery-timings',
  {id:'tgt-excel-23',name:'Vendor Delivery Timings',domain:'Operations',owner:'Operations Platform',usageFrequency:0,
   description:'Tracks supplier lead time performance and variance. Identifies reliable vendors and delivery risk across the supplier base.'},
  'vendor_delivery_timings',
  makeSql('Vendor Delivery Timings', R.supplier_lead.kpis, R.supplier_lead.tables, R.supplier_lead.dims));

// tgt-excel-24  Platform_Engagement_Daily  (Rationalize for src-28; Migrate for src-31)
writeReport('target','tgt-excel-24-platform-engagement-daily',
  {id:'tgt-excel-24',name:'Platform Engagement Daily',domain:'Product',owner:'Product Platform',usageFrequency:0,
   description:'Daily active users and session activity for the product platform. Foundational engagement metric for product analytics.'},
  'platform_engagement_daily',
  makeSql('Platform Engagement Daily', R.dau.kpis, R.dau.tables, R.dau.dims));

// tgt-excel-25  Capability_Uptake_Analytics  (Migrate target for src-29 & src-30)
writeReport('target','tgt-excel-25-capability-uptake-analytics',
  {id:'tgt-excel-25',name:'Capability Uptake Analytics',domain:'Product',owner:'Product Platform',usageFrequency:0,
   description:'Measures feature adoption including try rates, repeat usage, and 30-day active users. Identifies which capabilities gain traction post-launch.'},
  'capability_uptake_analytics',
  makeSql('Capability Uptake Analytics',
    [['COUNT','active_30d_id','active_30d'],['COUNT','repeat_user_id','repeat_users'],['COUNT','eligible_id','total_eligible_users'],['AVG','try_rate','try_rate_pct'],['COUNT','tried_id','users_who_tried']],
    ['feature_usage','features','users'],['feature_name']));

// tgt-excel-26  Audit_Finding_Register  (Migrate target for src-32)
writeReport('target','tgt-excel-26-audit-finding-register',
  {id:'tgt-excel-26',name:'Audit Finding Register',domain:'Risk',owner:'Risk Platform',usageFrequency:0,
   description:'Compliance audit findings summarized by category. Tracks open findings and average remediation days.'},
  'audit_finding_register',
  makeSql('Audit Finding Register',
    [['AVG','remediation_days','avg_remediation_days'],['COUNT','finding_id','finding_count']],
    ['audit_findings'],['finding_category']));

// tgt-excel-27  Debtor_Exposure_Rating  (Consolidate target for src-33)
writeReport('target','tgt-excel-27-debtor-exposure-rating',
  {id:'tgt-excel-27',name:'Debtor Exposure Rating',domain:'Risk',owner:'Risk Platform',usageFrequency:0,
   description:'Assesses customer credit exposure by combining credit limits, utilization, and AR aging. Supports credit risk monitoring.'},
  'debtor_exposure_rating',
  makeSql('Debtor Exposure Rating',
    [['AVG','days_late','avg_days_late'],['SUM','credit_limit','credit_limit'],['SUM','ar_exposure','current_ar_exposure'],['AVG','utilization_pct','utilization_pct']],
    ['customers','invoices'],['customer_name','credit_rating']));

// tgt-excel-28  Vendor_Security_Posture  (Migrate target for src-34)
writeReport('target','tgt-excel-28-vendor-security-posture',
  {id:'tgt-excel-28',name:'Vendor Security Posture',domain:'Risk',owner:'Risk Platform',usageFrequency:0,
   description:'Tracks vendor security assessment scores, risk tiers, and assessment recency. Supports third-party risk management.'},
  'vendor_security_posture',
  makeSql('Vendor Security Posture',
    [['AVG','days_since_assessment','days_since_assessment'],['AVG','security_score','security_score']],
    ['vendors','vendor_security_assessments'],['vendor_name','risk_tier','last_assessment_date']));

// tgt-excel-29  Distributor_Scorecard  (Migrate target for src-35 & src-36)
writeReport('target','tgt-excel-29-distributor-scorecard',
  {id:'tgt-excel-29',name:'Distributor Scorecard',domain:'Sales',owner:'Sales Platform',usageFrequency:0,
   description:'Evaluates distributor channel performance including revenue, order volume, and discount behavior. Benchmarks distributors across regions.'},
  'distributor_scorecard',
  makeSql('Distributor Scorecard',
    [['AVG','discount_pct','avg_discount_offered'],['SUM','channel_rev','channel_revenue'],['COUNT','order_id','order_count']],
    ['distributors','orders','order_items'],['distributor_name','region']));

// tgt-excel-30  Stage_By_Stage_Deal_Flow  (Rationalize for src-38; Migrate for src-37)
writeReport('target','tgt-excel-30-stage-by-stage-deal-flow',
  {id:'tgt-excel-30',name:'Stage By Stage Deal Flow',domain:'Sales',owner:'Sales Platform',usageFrequency:0,
   description:'Pipeline view showing opportunities entered, pipeline value, and average probability by stage. Supports sales forecasting.'},
  'stage_by_stage_deal_flow',
  makeSql('Stage By Stage Deal Flow', R.pipeline_funnel.kpis, R.pipeline_funnel.tables, R.pipeline_funnel.dims));

// tgt-excel-31  Seller_Achievement_Rollup  (Migrate target for src-39 & src-40)
writeReport('target','tgt-excel-31-seller-achievement-rollup',
  {id:'tgt-excel-31',name:'Seller Achievement Rollup',domain:'Sales',owner:'Sales Platform',usageFrequency:0,
   description:'Rolls up sales rep performance including booked revenue, deal count, and quota attainment. Core sales productivity report.'},
  'seller_achievement_rollup',
  makeSql('Seller Achievement Rollup',
    [['AVG','deal_size','avg_deal_size'],['SUM','booked_rev','booked_revenue'],['COUNT','deal_id','deals_closed'],['SUM','quota_amt','quota_amount'],['AVG','quota_attainment','quota_attainment_pct']],
    ['orders','order_items','sales_reps'],['rep_name']));

console.log('\nDone. All sample-data-excel folders created.');
console.log(`Source path: ${ROOT}/source`);
console.log(`Target path: ${ROOT}/target`);
