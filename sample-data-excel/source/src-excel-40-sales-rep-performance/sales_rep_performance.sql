-- Sales Rep Performance
SELECT
  SUM(t.booked_rev) AS booked_revenue,
  COUNT(t.deal_id) AS deals_closed,
  SUM(t.quota_amt) AS quota_amount,
  COUNT(t.customer_id) AS unique_customers,
  t.rep_name
FROM orders t
JOIN order_items j ON t.id = j.id
JOIN sales_reps j ON t.id = j.id
GROUP BY t.rep_name