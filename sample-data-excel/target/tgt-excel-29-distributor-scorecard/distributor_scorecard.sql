-- Distributor Scorecard
SELECT
  AVG(t.discount_pct) AS avg_discount_offered,
  SUM(t.channel_rev) AS channel_revenue,
  COUNT(t.order_id) AS order_count,
  t.distributor_name,
  t.region
FROM distributors t
JOIN orders j ON t.id = j.id
JOIN order_items j ON t.id = j.id
GROUP BY t.distributor_name, t.region