-- Network operations KPI set — reference platform
SELECT
  AVG(n.latency_ms)           AS avg_latency,
  AVG(n.packet_loss_pct)      AS packet_loss_rate,
  AVG(n.uptime_pct)           AS uptime_pct,
  AVG(n.bandwidth_util_pct)   AS bandwidth_util,
  COUNT(n.alert_id)           AS alert_count
FROM fact_network_perf n
JOIN dim_site s ON n.site_id = s.id
JOIN dim_region r ON s.region_id = r.id
WHERE n.is_production = 1
GROUP BY s.site_name, r.region_name
