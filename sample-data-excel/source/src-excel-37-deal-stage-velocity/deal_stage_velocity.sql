-- Deal Stage Velocity
SELECT
  SUM(t.pipeline_amount) AS aggregate_pipeline,
  AVG(t.days_in_stage) AS avg_days_in_stage,
  COUNT(t.opp_id) AS opportunity_count,
  t.stage_name
FROM opportunity_history t

GROUP BY t.stage_name