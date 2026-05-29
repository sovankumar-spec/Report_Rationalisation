-- Cross Sell Basket Analysis
SELECT
  COUNT(t.co_occurrence_id) AS co_occurrence_count,
  SUM(t.cross_sell_rev) AS cross_sell_revenue,
  t.anchor_product,
  t.cross_sell_product
FROM product_master t
JOIN order_items j ON t.id = j.id
GROUP BY t.anchor_product, t.cross_sell_product