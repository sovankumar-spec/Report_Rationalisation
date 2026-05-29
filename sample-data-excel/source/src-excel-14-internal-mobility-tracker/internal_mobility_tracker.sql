-- Internal Mobility Tracker
SELECT
  AVG(t.tenure_at_move) AS avg_tenure_at_move,
  COUNT(t.move_id) AS move_count,
  t.from_department,
  t.move_type,
  t.to_department
FROM employee_movements t
JOIN employees j ON t.id = j.id
GROUP BY t.from_department, t.move_type, t.to_department