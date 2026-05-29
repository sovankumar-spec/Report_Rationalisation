-- Regional Sales Analysis
SELECT
  SUM(s.revenue) AS total_revenue,
  AVG(s.deal_size) AS avg_deal_size,
  SUM(s.regional_quota) AS regional_quota,
  COUNT(s.territory_id) AS territory_count,
  s.region
FROM fact_sales s
JOIN dim_region r ON s.region_id = r.region_id
GROUP BY s.region