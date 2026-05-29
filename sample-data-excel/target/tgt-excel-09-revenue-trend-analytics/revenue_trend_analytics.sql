-- Revenue Trend Analytics
SELECT
  AVG(t.order_value) AS avg_order_value,
  COUNT(t.customer_id) AS customer_count,
  SUM(t.gross_rev) AS gross_revenue,
  SUM(t.net_rev) AS net_revenue,
  COUNT(t.order_id) AS order_count,
  t.product_category,
  t.revenue_month
FROM orders t
JOIN order_items j ON t.id = j.id
JOIN product_master j ON t.id = j.id
GROUP BY t.product_category, t.revenue_month