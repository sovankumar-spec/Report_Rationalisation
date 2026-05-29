-- Revenue summary by customer segment
SELECT
  SUM(billing.amount)     AS total_revenue,
  AVG(billing.amount)     AS avg_revenue,
  COUNT(customer.id)      AS customer_count
FROM fact_billing billing
JOIN dim_customer customer ON billing.customer_id = customer.id
WHERE billing.billing_date >= '2024-01-01'
GROUP BY customer.segment
