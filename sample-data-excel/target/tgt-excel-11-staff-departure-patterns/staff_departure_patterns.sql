-- Staff Departure Patterns
SELECT
  AVG(t.tenure_at_exit) AS avg_tenure_at_exit,
  COUNT(t.termination_id) AS terminations,
  COUNT(t.voluntary_id) AS voluntary_count,
  AVG(t.voluntary_pct) AS voluntary_pct,
  t.department_name,
  t.termination_reason
FROM departments t
JOIN employees j ON t.id = j.id
GROUP BY t.department_name, t.termination_reason