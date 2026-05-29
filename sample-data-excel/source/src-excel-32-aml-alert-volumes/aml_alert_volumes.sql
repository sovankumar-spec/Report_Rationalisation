-- AML Alert Volumes
SELECT
  COUNT(t.hit_id) AS alert_count,
  SUM(t.transaction_amount) AS flagged_amount,
  t.rule_name,
  t.alert_week
FROM aml_rule_hits t
JOIN aml_rules j ON t.id = j.id
JOIN transactions j ON t.id = j.id
GROUP BY t.rule_name, t.alert_week