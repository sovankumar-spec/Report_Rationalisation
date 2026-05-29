-- Geographic Sales Summary
SELECT
  SUM(t.gross_rev) AS gross_revenue,
  SUM(t.net_rev) AS net_revenue,
  COUNT(t.order_id) AS order_count,
  SUM(t.total_disc) AS total_discount,
  t.region_name,
  t.revenue_quarter
FROM orders t
JOIN order_items j ON t.id = j.id
JOIN customers j ON t.id = j.id
JOIN regions j ON t.id = j.id
GROUP BY t.region_name, t.revenue_quarter