-- Open Receivables View
SELECT
  AVG(t.days_overdue) AS days_overdue,
  SUM(t.invoice_amount) AS invoice_amount,
  SUM(t.outstanding_bal) AS outstanding_balance,
  SUM(t.paid_amount) AS paid_amount,
  t.customer_name
FROM customers t
JOIN invoices j ON t.id = j.id
GROUP BY t.customer_name