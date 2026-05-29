-- Distribution Network Map V2
SELECT
  COUNT(t.shipment_id) AS outbound_shipments,
  SUM(t.weight_kg) AS total_weight_shipped,
  t.region,
  t.warehouse_name
FROM warehouses t
JOIN shipments j ON t.id = j.id
GROUP BY t.region, t.warehouse_name