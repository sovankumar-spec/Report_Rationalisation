-- Customer Voice Topics V3
SELECT
  AVG(t.sentiment_score) AS avg_sentiment,
  COUNT(t.mention_id) AS mention_count,
  t.sentiment_category,
  t.topic_name
FROM voice_analytics t

GROUP BY t.sentiment_category, t.topic_name