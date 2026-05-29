-- Sales performance KPI set — reference platform
SELECT
  COUNT(o.opportunity_id)     AS total_deals,
  COUNT(o.won_flag)           AS won_deals,
  AVG(o.deal_value)           AS avg_deal_value,
  SUM(o.deal_value)           AS pipeline_value,
  SUM(o.quota_amount)         AS quota_attainment,
  AVG(o.win_rate)             AS win_rate
FROM fact_opportunity o
JOIN dim_sales_rep r ON o.rep_id = r.id
JOIN dim_product p ON o.product_id = p.id
GROUP BY r.territory, p.product_line
