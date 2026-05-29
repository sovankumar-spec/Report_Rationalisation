-- Release Stability Report
SELECT
  COUNT(t.crash_id) AS crash_count,
  AVG(t.crash_free_pct) AS crash_free_pct,
  COUNT(t.session_id) AS total_sessions,
  t.release_name
FROM releases t
JOIN sessions j ON t.id = j.id
GROUP BY t.release_name