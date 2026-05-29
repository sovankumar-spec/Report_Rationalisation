-- Customer Lifetime Value Report
SELECT
  AVG(t.order_value) AS avg_order_value,
  COUNT(t.order_id) AS order_count,
  SUM(t.lifetime_val) AS lifetime_value,
  t.customer_name,
  t.first_order_date,
  t.last_order_date
FROM customers t
JOIN orders j ON t.id = j.id
JOIN order_items j ON t.id = j.id
GROUP BY t.customer_name, t.first_order_date, t.last_order_date