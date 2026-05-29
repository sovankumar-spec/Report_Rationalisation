-- Manufacturing Yield Dashboard
SELECT
  SUM(t.input_qty) AS total_input,
  SUM(t.output_qty) AS total_output,
  SUM(t.scrap_qty) AS total_scrap,
  AVG(t.scrap_rate) AS scrap_rate,
  t.plant_name,
  t.product_category
FROM plants t
JOIN production_orders j ON t.id = j.id
JOIN product_master j ON t.id = j.id
GROUP BY t.plant_name, t.product_category