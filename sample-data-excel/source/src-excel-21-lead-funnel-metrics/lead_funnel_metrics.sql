-- Lead Funnel Metrics
SELECT
  COUNT(t.converted_id) AS converted_leads,
  COUNT(t.qualified_id) AS qualified_leads,
  COUNT(t.lead_id) AS total_leads,
  t.lead_source
FROM leads t

GROUP BY t.lead_source