-- Sales pipeline KPIs by territory and fiscal quarter
SELECT
  COUNT(o.opportunity_id)     AS total_deals,
  COUNT(o.won_flag)           AS won_deals,
  AVG(o.deal_value)           AS avg_deal_value,
  SUM(o.deal_value)           AS pipeline_value,
  AVG(o.conversion_rate)      AS conversion_rate
FROM fact_opportunity o
JOIN dim_sales_rep r ON o.rep_id = r.id
GROUP BY r.territory, o.fiscal_quarter
