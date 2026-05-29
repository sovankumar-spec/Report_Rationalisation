-- Server Performance Dashboard
SELECT
  AVG(t.cpu_pct) AS avg_cpu,
  AVG(t.memory_pct) AS avg_memory,
  SUM(t.downtime_min) AS total_downtime_minutes,
  t.server_name,
  t.environment
FROM server_monitoring t
JOIN servers j ON t.id = j.id
GROUP BY t.server_name, t.environment