-- Pipeline Conversion Funnel
SELECT
  AVG(t.probability) AS avg_probability,
  COUNT(t.opp_id) AS opportunities_entered,
  SUM(t.pipeline_amount) AS pipeline_value,
  t.stage_name
FROM opportunities t

GROUP BY t.stage_name