-- Treasury Liquidity Snapshot
SELECT
  AVG(t.days_held) AS avg_days_held,
  SUM(t.closing_balance) AS closing_balance,
  SUM(t.interest_earned) AS interest_earned,
  t.account_type
FROM bank_accounts t

GROUP BY t.account_type