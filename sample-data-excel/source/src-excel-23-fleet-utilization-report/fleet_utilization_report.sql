-- Fleet Utilization Report
SELECT
  AVG(t.utilization_pct) AS avg_utilization_pct,
  COUNT(t.vehicle_id) AS fleet_size,
  SUM(t.miles_driven) AS total_miles,
  t.home_depot,
  t.vehicle_type
FROM fleet_logs t
JOIN vehicles j ON t.id = j.id
GROUP BY t.home_depot, t.vehicle_type