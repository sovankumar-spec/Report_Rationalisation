-- Supply Chain Metrics
SELECT
  AVG(o.cycle_time) AS avg_cycle_time,
  AVG(o.utilization_rate) AS utilization_rate,
  COUNT(o.incident_id) AS incident_count,
  SUM(o.units_produced) AS units_produced,
  AVG(o.defect_rate) AS defect_rate,
  AVG(o.supplier_lead_time) AS supplier_lead_time,
  o.facility_id
FROM fact_operations o
JOIN dim_supplier s ON o.supplier_id = s.supplier_id
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY o.facility_id