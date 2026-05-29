-- Benefits Enrollment Stats
SELECT
  AVG(t.premium_amount) AS avg_premium,
  COUNT(t.employee_id) AS enrolled_count,
  t.plan_name
FROM benefit_enrollments t
JOIN benefit_plans j ON t.id = j.id
GROUP BY t.plan_name