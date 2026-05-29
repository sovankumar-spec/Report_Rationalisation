-- Stock Movement Ratio
SELECT
  AVG(t.inventory_value) AS avg_inventory_value,
  SUM(t.cogs) AS cogs_amount,
  t.product_category
FROM inventory_snapshots t
JOIN shipments j ON t.id = j.id
JOIN shipment_items j ON t.id = j.id
JOIN product_master j ON t.id = j.id
GROUP BY t.product_category