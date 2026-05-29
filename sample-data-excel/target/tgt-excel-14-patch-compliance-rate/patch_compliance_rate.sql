-- Patch Compliance Rate
SELECT
  COUNT(t.endpoint_id) AS endpoint_count,
  AVG(t.compliance_pct) AS patch_compliance_pct,
  COUNT(t.patched_id) AS patched_endpoints,
  t.operating_system
FROM endpoints t
JOIN patch_status j ON t.id = j.id
GROUP BY t.operating_system