-- Campaign ROI Analysis
SELECT
  SUM(t.expense_amount) AS actual_spend,
  SUM(t.budget_amount) AS budget_amount,
  COUNT(t.customer_id) AS customers_acquired,
  SUM(t.attributed_rev) AS revenue_generated,
  t.campaign_name
FROM campaigns t
JOIN campaign_expenses j ON t.id = j.id
JOIN attribution j ON t.id = j.id
GROUP BY t.campaign_name