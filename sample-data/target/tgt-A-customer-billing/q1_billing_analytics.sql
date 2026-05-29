-- Customer billing analytics — reference KPI set
SELECT
  SUM(billing.amount)             AS total_revenue,
  AVG(billing.amount)             AS avg_revenue,
  COUNT(customer.id)              AS customer_count,
  SUM(billing.discount_amount)    AS total_discount
FROM fact_billing billing
JOIN dim_customer customer ON billing.customer_id = customer.id
JOIN dim_date d ON billing.date_key = d.date_key
WHERE d.fiscal_year = 2024
GROUP BY customer.segment, d.quarter
