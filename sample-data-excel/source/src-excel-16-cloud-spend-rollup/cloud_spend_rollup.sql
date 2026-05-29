-- Cloud Spend Rollup
SELECT
  SUM(t.cost_amount) AS total_cost,
  SUM(t.usage_amount) AS total_usage,
  t.cloud_provider,
  t.service_name,
  t.billing_month
FROM cloud_costs t

GROUP BY t.cloud_provider, t.service_name, t.billing_month