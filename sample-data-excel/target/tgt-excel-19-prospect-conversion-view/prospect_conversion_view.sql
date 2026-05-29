-- Prospect_Conversion_View
SELECT
  COUNT(t.prospect_id) AS prospect_count,
  COUNT(t.converted_id) AS converted_prospects,
  AVG(t.conversion_rate) AS conversion_rate_pct,
  t.lead_stage,
  t.channel
FROM prospects t
JOIN campaigns j ON t.id = j.id
GROUP BY t.lead_stage, t.channel