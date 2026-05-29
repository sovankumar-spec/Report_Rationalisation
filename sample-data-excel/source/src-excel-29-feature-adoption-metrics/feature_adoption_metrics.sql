-- Feature Adoption Metrics
SELECT
  COUNT(t.repeat_user_id) AS repeat_users,
  COUNT(t.eligible_user_id) AS total_eligible_users,
  COUNT(t.tried_user_id) AS users_who_tried,
  AVG(t.adoption_rate) AS feature_adoption_rate,
  AVG(t.reach_pct) AS feature_reach_pct,
  t.feature_name
FROM feature_usage t
JOIN features j ON t.id = j.id
JOIN users j ON t.id = j.id
GROUP BY t.feature_name