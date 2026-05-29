-- Active headcount and workforce health metrics by department
SELECT
  COUNT(e.employee_id)        AS headcount,
  AVG(e.tenure_years)         AS avg_tenure,
  COUNT(e.new_hire_flag)      AS hire_count,
  AVG(e.attrition_score)      AS attrition_rate
FROM fact_workforce e
JOIN dim_department d ON e.dept_id = d.id
WHERE e.employment_status = 'Active'
GROUP BY d.department_name, d.cost_center
