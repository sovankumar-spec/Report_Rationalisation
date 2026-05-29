-- Revenue Pipeline Report
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
GROUP BY s.stage