-- Training Compliance Dashboard
SELECT
  AVG(t.days_to_complete) AS avg_days_to_complete,
  COUNT(t.completed_id) AS completed_count,
  COUNT(t.enrolled_id) AS enrolled_count,
  t.course_name,
  t.is_mandatory
FROM training_courses t
JOIN training_enrollments j ON t.id = j.id
GROUP BY t.course_name, t.is_mandatory