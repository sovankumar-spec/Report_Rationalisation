-- Vendor Security Posture
SELECT
  AVG(t.days_since_assessment) AS days_since_assessment,
  AVG(t.security_score) AS security_score,
  t.vendor_name,
  t.risk_tier,
  t.last_assessment_date
FROM vendors t
JOIN vendor_security_assessments j ON t.id = j.id
GROUP BY t.vendor_name, t.risk_tier, t.last_assessment_date