-- Supplier Lead Time Report
SELECT
  AVG(t.lead_time_days) AS avg_lead_time_days,
  MAX(t.lead_time) AS max_lead_time,
  MIN(t.lead_time_min) AS min_lead_time,
  COUNT(t.order_id) AS order_count,
  t.supplier_name
FROM goods_receipts t
JOIN purchase_orders j ON t.id = j.id
JOIN suppliers j ON t.id = j.id
GROUP BY t.supplier_name