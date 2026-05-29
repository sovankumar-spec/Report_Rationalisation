-- Network Bandwidth Usage
SELECT
  AVG(t.bandwidth_mbps) AS avg_bandwidth,
  MAX(t.peak_bandwidth_mbps) AS peak_bandwidth,
  t.subnet_id
FROM network_metrics t

GROUP BY t.subnet_id