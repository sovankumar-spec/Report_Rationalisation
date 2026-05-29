-- Self Service Usage
SELECT
  COUNT(t.view_id) AS article_views,
  AVG(t.time_on_page) AS avg_time_on_page,
  COUNT(t.deflected_id) AS deflected_views,
  t.category
FROM kb_views t
JOIN knowledge_base j ON t.id = j.id
GROUP BY t.category