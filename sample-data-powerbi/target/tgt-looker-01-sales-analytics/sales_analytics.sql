-- Sales Analytics
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
GROUP BY s.region