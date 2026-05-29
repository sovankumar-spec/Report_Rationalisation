-- Seller Achievement Rollup
SELECT
  AVG(t.deal_size) AS avg_deal_size,
  SUM(t.booked_rev) AS booked_revenue,
  COUNT(t.deal_id) AS deals_closed,
  SUM(t.quota_amt) AS quota_amount,
  AVG(t.quota_attainment) AS quota_attainment_pct,
  t.rep_name
FROM orders t
JOIN order_items j ON t.id = j.id
JOIN sales_reps j ON t.id = j.id
GROUP BY t.rep_name