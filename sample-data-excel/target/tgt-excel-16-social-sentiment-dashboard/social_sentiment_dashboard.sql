-- Social Sentiment Dashboard
SELECT
  AVG(t.sentiment_score) AS avg_sentiment,
  SUM(t.engagement_count) AS engagements,
  COUNT(t.post_id) AS post_count,
  t.platform,
  t.post_week
FROM social_media_posts t

GROUP BY t.platform, t.post_week