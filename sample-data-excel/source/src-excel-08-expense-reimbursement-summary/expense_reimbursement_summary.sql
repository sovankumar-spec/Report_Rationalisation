-- Expense Reimbursement Summary
SELECT
  AVG(t.approved_amt) AS avg_reimbursement,
  COUNT(t.report_id) AS report_count,
  SUM(t.total_approved) AS total_approved,
  t.expense_category,
  t.expense_month
FROM expense_reports t

GROUP BY t.expense_category, t.expense_month