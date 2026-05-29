-- Audit Finding Register
SELECT
  AVG(t.remediation_days) AS avg_remediation_days,
  COUNT(t.finding_id) AS finding_count,
  t.finding_category
FROM audit_findings t

GROUP BY t.finding_category