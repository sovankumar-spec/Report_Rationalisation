-- Cost Allocation Audit V2
SELECT
  SUM(t.allocated_amount) AS allocated_total,
  COUNT(t.allocation_id) AS allocation_events,
  t.account_name,
  t.cost_center_name
FROM cost_allocations t
JOIN cost_centers j ON t.id = j.id
JOIN gl_accounts j ON t.id = j.id
GROUP BY t.account_name, t.cost_center_name