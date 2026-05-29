-- Brand Awareness Index
SELECT
  AVG(t.aided_score) AS avg_aided_awareness,
  AVG(t.unaided_score) AS avg_unaided_awareness,
  COUNT(t.respondent_id) AS total_respondents,
  t.demographic_segment,
  t.region
FROM brand_surveys t
JOIN survey_responses j ON t.id = j.id
GROUP BY t.demographic_segment, t.region