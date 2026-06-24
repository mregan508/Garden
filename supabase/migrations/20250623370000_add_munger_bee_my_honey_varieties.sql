-- Munger black raspberry and Bee-My-Honey lavender cultivars

INSERT INTO plant_catalog_variety (plant_catalog_id, name, description, sort_order)
SELECT c.id, v.name, v.description, v.sort_order
FROM plant_catalog c
JOIN (VALUES
  ('Red Raspberry', 'Munger', 'Black raspberry (Rubus occidentalis); classic hardy NE cultivar', 9),
  ('Lavender', 'Bee-My-Honey', 'Sweet lavender; Munstead-type; fine culinary fragrance', 9)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
