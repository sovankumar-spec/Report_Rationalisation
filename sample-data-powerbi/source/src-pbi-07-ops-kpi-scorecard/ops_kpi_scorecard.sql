-- Operations KPI Scorecard
SELECT
  AVG(o.cycle_time) AS avg_cycle_time,
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.incident_id) AS incident_count,
  AVG(o.oee_score) AS oee_score,
  SUM(o.units_produced) AS units_produced,
  AVG(o.defect_rate) AS defect_rate,
  o.facility_id
FROM fact_operations o
JOIN dim_facility f ON o.facility_id = f.facility_id
JOIN dim_workforce w ON o.workforce_id = w.workforce_id
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY o.facility_id