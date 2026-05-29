-- Budget Tracker
SELECT
  SUM(f.revenue) AS total_revenue,
  SUM(f.expenses) AS total_expenses,
  SUM(f.gross_profit) AS gross_profit,
  AVG(f.budget_variance) AS budget_variance,
  SUM(f.net_income) AS net_income,
  SUM(f.capex_spend) AS capex_spend,
  f.cost_center
FROM fact_financials f
JOIN dim_account a ON f.account_id = a.account_id
JOIN dim_cost_center cc ON f.cost_center_id = cc.cost_center_id
GROUP BY f.cost_center