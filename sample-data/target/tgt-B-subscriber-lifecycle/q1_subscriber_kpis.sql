-- Subscriber lifecycle KPIs — reference platform
SELECT
  COUNT(s.subscription_id)          AS churn_count,
  AVG(s.months_active)              AS avg_churn_tenure,
  COUNT(DISTINCT s.customer_id)     AS new_subs,
  SUM(s.mrr_amount)                 AS total_mrr
FROM fact_subscription s
JOIN dim_customer c ON s.customer_id = c.id
JOIN dim_date d ON s.period_key = d.date_key
GROUP BY s.status, d.month
