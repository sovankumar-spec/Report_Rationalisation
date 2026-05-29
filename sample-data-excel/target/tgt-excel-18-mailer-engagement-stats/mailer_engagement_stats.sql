-- Mailer Engagement Stats
SELECT
  AVG(t.open_rate_pct) AS open_rate,
  COUNT(t.click_id) AS total_clicks,
  COUNT(t.open_id) AS total_opens,
  COUNT(t.send_id) AS total_sent,
  COUNT(t.unsub_id) AS unsubscribes,
  t.campaign_name
FROM email_campaigns t
JOIN email_events j ON t.id = j.id
GROUP BY t.campaign_name