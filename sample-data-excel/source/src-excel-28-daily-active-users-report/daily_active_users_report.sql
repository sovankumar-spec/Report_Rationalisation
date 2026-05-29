-- Daily Active Users Report
SELECT
  COUNT(t.user_id) AS dau,
  COUNT(t.session_id) AS session_count,
  t.activity_date
FROM usage_logs t

GROUP BY t.activity_date