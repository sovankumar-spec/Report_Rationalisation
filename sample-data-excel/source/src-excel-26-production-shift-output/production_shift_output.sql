-- Production Shift Output
SELECT
  AVG(t.downtime_min) AS avg_downtime,
  SUM(t.units_produced) AS shift_output,
  t.plant_name,
  t.shift_name,
  t.prod_date
FROM plants t
JOIN production_logs j ON t.id = j.id
JOIN shifts j ON t.id = j.id
GROUP BY t.plant_name, t.shift_name, t.prod_date