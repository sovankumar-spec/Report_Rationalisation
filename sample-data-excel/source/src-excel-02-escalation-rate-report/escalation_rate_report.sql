-- Escalation Rate Report
SELECT
  AVG(t.hours_to_escalate) AS avg_hours_to_escalate,
  COUNT(t.escalation_id) AS escalation_count,
  t.escalation_reason
FROM escalations t
JOIN tickets j ON t.id = j.id
GROUP BY t.escalation_reason