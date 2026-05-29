-- Workforce Dashboard
SELECT
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.employee_id) AS headcount,
  AVG(o.attrition_rate) AS attrition_rate,
  AVG(o.engagement_score) AS engagement_score,
  COUNT(o.training_hours) AS training_completion,
  o.department
FROM fact_operations o
JOIN dim_workforce w ON o.workforce_id = w.workforce_id
JOIN dim_department d ON o.department_id = d.department_id
GROUP BY o.department