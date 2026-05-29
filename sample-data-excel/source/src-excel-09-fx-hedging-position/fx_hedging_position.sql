-- FX Hedging Position
SELECT
  AVG(t.hedge_rate) AS avg_hedge_rate,
  SUM(t.notional_amount) AS total_notional,
  SUM(t.unrealized_pnl) AS unrealized_pnl,
  t.currency_pair,
  t.hedge_type
FROM hedge_positions t

GROUP BY t.currency_pair, t.hedge_type