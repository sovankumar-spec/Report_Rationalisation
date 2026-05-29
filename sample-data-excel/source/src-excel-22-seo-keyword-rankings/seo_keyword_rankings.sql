-- SEO Keyword Rankings
SELECT
  AVG(t.search_position) AS avg_position,
  COUNT(t.click_id) AS total_clicks,
  COUNT(t.impression_id) AS total_impressions,
  t.keyword_text
FROM keyword_rankings t
JOIN keywords j ON t.id = j.id
GROUP BY t.keyword_text