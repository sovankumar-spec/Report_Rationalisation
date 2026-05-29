-- Attrition Trend Analysis
SELECT
  AVG(t.tenure_at_exit) AS avg_tenure_at_exit,
  AVG(t.tenure_months) AS avg_tenure_months,
  COUNT(t.termination_id) AS terminations,
  COUNT(t.voluntary_id) AS voluntary_count,
  t.department_name,
  t.termination_reason
FROM departments t
JOIN employees j ON t.id = j.id
GROUP BY t.department_name, t.termination_reason