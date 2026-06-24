-- Comfrey, Oregano, and additional Basil varieties

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Comfrey',
    'Symphytum officinale',
    'Full sun to partial shade',
    'Regular; tolerates moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardy perennial; deep taproot; spreads—plant where contained in NE"}'::jsonb,
    '["Fruit trees", "Tomato", "Asparagus"]'::jsonb,
    '["Dynamic accumulator; chop-and-drop mulch", "Traditional medicinal herb", "Bees love the flowers"]'::jsonb
  ),
  (
    'Oregano',
    'Origanum vulgare',
    'Full sun',
    'Low to moderate; well-drained',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Hardy culinary oregano; pot and overwinter in coldest NE sites"}'::jsonb,
    '["Basil", "Pepper", "Cabbage"]'::jsonb,
    '["Classic pizza and tomato herb", "Drought tolerant once established", "Attracts pollinators"]'::jsonb
  )
ON CONFLICT ((lower(common_name))) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  light_requirements = EXCLUDED.light_requirements,
  water_needs = EXCLUDED.water_needs,
  climate_preferences = EXCLUDED.climate_preferences,
  companion_plants = EXCLUDED.companion_plants,
  benefits = EXCLUDED.benefits,
  updated_at = now();

INSERT INTO plant_catalog_variety (plant_catalog_id, name, description, sort_order)
SELECT c.id, v.name, v.description, v.sort_order
FROM plant_catalog c
JOIN (VALUES
  ('Comfrey', 'Bocking 14', 'Sterile Russian comfrey; won''t seed around', 1),
  ('Comfrey', 'True Comfrey', 'Symphytum officinale; classic variety', 2),
  ('Comfrey', 'Axminster Gold', 'Variegated gold leaf comfrey', 3),
  ('Comfrey', 'Wild Native', 'Common comfrey from division', 4),
  ('Oregano', 'Italian', 'Mild sweet oregano for cooking', 1),
  ('Oregano', 'Greek', 'Strong flavor; dries well', 2),
  ('Oregano', 'Hot and Spicy', 'Peppery oregano', 3),
  ('Oregano', 'Compactum', 'Low mounding habit', 4),
  ('Basil', 'Sweet Basil', 'Standard green basil', 5),
  ('Basil', 'Holy Basil (Tulsi)', 'Sacred basil; tea herb', 6),
  ('Basil', 'Cinnamon Basil', 'Spicy cinnamon-scented leaves', 7),
  ('Basil', 'Purple Ruffles', 'Frilly purple ornamental basil', 8)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
