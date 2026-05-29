-- Churn count and average tenure by churn reason
SELECT
  COUNT(s.subscription_id)    AS churn_count,
  AVG(s.months_active)        AS avg_churn_tenure
FROM fact_subscription s
JOIN dim_customer c ON s.customer_id = c.id
WHERE s.status = 'Churned'
GROUP BY s.churn_reason
