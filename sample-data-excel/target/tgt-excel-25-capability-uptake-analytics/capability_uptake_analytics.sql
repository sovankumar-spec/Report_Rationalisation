-- Capability Uptake Analytics
SELECT
  COUNT(t.active_30d_id) AS active_30d,
  COUNT(t.repeat_user_id) AS repeat_users,
  COUNT(t.eligible_id) AS total_eligible_users,
  AVG(t.try_rate) AS try_rate_pct,
  COUNT(t.tried_id) AS users_who_tried,
  t.feature_name
FROM feature_usage t
JOIN features j ON t.id = j.id
JOIN users j ON t.id = j.id
GROUP BY t.feature_name