-- Session Heatmap
SELECT
  AVG(t.duration_sec) AS avg_duration,
  AVG(t.median_duration_sec) AS median_duration,
  COUNT(t.session_id) AS session_count,
  t.app_version,
  t.platform
FROM sessions t

GROUP BY t.app_version, t.platform