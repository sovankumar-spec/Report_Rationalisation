-- Cash Flow Forecast
SELECT
  SUM(t.projected_inflow) AS projected_inflow,
  SUM(t.projected_outflow) AS projected_outflow,
  SUM(t.net_cash) AS net_cash_flow,
  AVG(t.opening_balance) AS opening_balance,
  t.forecast_source,
  t.forecast_week
FROM cash_forecasts t

GROUP BY t.forecast_source, t.forecast_week