-- Regulatory Filing Tracker
SELECT
  SUM(t.calculated_liability) AS calculated_liability,
  SUM(t.outstanding_amt) AS outstanding,
  SUM(t.paid_amount) AS paid_amount,
  t.jurisdiction,
  t.tax_type,
  t.filing_due_date
FROM tax_liabilities t

GROUP BY t.jurisdiction, t.tax_type, t.filing_due_date