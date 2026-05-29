-- AP Aging Summary
SELECT
  SUM(t.days_1_30_amt) AS days_1_30,
  SUM(t.days_31_60_amt) AS days_31_60,
  SUM(t.days_60plus_amt) AS days_60_plus,
  COUNT(t.bill_id) AS open_bills,
  SUM(t.outstanding) AS total_outstanding,
  t.vendor_name,
  t.payment_terms
FROM vendor_bills t
JOIN vendors j ON t.id = j.id
GROUP BY t.vendor_name, t.payment_terms