-- Quote To Close Ratio
SELECT
  AVG(t.close_rate) AS close_rate_pct,
  COUNT(t.quote_id) AS quotes_issued,
  COUNT(t.won_id) AS quotes_won,
  t.rep_name
FROM quotes t
JOIN sales_reps j ON t.id = j.id
GROUP BY t.rep_name