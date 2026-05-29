-- Workforce Composition View
SELECT
  AVG(t.tenure_years) AS avg_tenure_years,
  COUNT(t.employee_id) AS headcount,
  t.department_name,
  t.employment_type
FROM departments t
JOIN employees j ON t.id = j.id
GROUP BY t.department_name, t.employment_type