-- Debtor Exposure Rating
SELECT
  AVG(t.days_late) AS avg_days_late,
  SUM(t.credit_limit) AS credit_limit,
  SUM(t.ar_exposure) AS current_ar_exposure,
  AVG(t.utilization_pct) AS utilization_pct,
  t.customer_name,
  t.credit_rating
FROM customers t
JOIN invoices j ON t.id = j.id
GROUP BY t.customer_name, t.credit_rating