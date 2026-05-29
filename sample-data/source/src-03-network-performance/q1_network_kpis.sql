-- Network site performance over rolling 30 days
SELECT
  AVG(n.latency_ms)       AS avg_latency,
  AVG(n.packet_loss_pct)  AS packet_loss_rate,
  AVG(n.uptime_pct)       AS uptime_pct,
  MAX(n.throughput_mbps)  AS peak_throughput
FROM fact_network_perf n
JOIN dim_site s ON n.site_id = s.id
WHERE n.measurement_date >= DATEADD(day, -30, GETDATE())
GROUP BY s.region_id
