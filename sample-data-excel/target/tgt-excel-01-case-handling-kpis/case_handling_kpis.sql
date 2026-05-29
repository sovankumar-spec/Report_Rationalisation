-- Case Handling KPIs
SELECT
  AVG(t.resolution_hours) AS avg_resolution_hours,
  COUNT(t.sla_id) AS sla_met_count,
  COUNT(t.ticket_id) AS ticket_count,
  t.category
FROM tickets t

GROUP BY t.category