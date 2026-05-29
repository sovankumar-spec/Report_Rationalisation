-- Cash Flow Monitor
SELECT
  SUM(f.revenue) AS total_revenue,
  SUM(f.operating_cash) AS operating_cash_flow,
  SUM(f.financing_cash) AS financing_activities,
  AVG(f.cash_conversion) AS cash_conversion_cycle,
  f.period
FROM fact_financials f
JOIN dim_account a ON f.account_id = a.account_id
GROUP BY f.period