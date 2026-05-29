-- Supplier Payables Aging
SELECT
  SUM(t.overdue_30) AS overdue_30_days,
  SUM(t.overdue_60) AS overdue_60_days,
  SUM(t.total_payable) AS total_payables,
  COUNT(t.vendor_id) AS vendor_count,
  t.vendor_name,
  t.payment_terms
FROM accounts_payable t
JOIN vendors j ON t.id = j.id
GROUP BY t.vendor_name, t.payment_terms