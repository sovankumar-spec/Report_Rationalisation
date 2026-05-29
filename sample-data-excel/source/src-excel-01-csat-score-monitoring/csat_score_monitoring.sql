-- CSAT Score Monitoring
SELECT
  AVG(t.satisfaction_score) AS avg_csat,
  COUNT(t.negative_id) AS negative_count,
  COUNT(t.positive_id) AS positive_count,
  COUNT(t.response_id) AS response_count,
  AVG(t.satisfaction_rate) AS satisfaction_rate,
  t.category
FROM csat_surveys t
JOIN tickets j ON t.id = j.id
GROUP BY t.category