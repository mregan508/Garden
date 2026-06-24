-- Jerusalem artichoke (sunchoke) for Northeast gardens

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Jerusalem Artichoke',
    'Helianthus tuberosus',
    'Full sun',
    'Moderate; drought tolerant once established',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardy tuber crop; spreads by rhizomes—plant in contained bed in NE"}'::jsonb,
    '["Corn", "Sunflower", "Potato"]'::jsonb,
    '["Edible nutty tubers harvested in fall", "Native sunflower relative", "Pollinator-friendly yellow blooms"]'::jsonb
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
  ('Jerusalem Artichoke', 'Stampede', 'Early maturing; cold-hardy NE favorite', 1),
  ('Jerusalem Artichoke', 'Fuseau', 'Smooth tubers; less knobby', 2),
  ('Jerusalem Artichoke', 'White French', 'Large white tubers; classic type', 3),
  ('Jerusalem Artichoke', 'Golden Nugget', 'Small golden tubers; sweet', 4),
  ('Jerusalem Artichoke', 'Red Fuseau', 'Red-skinned smooth tubers', 5),
  ('Jerusalem Artichoke', 'Waldspinel', 'Red tubers; Austrian heirloom', 6),
  ('Jerusalem Artichoke', 'Beaver Valley Purple', 'Purple-skinned sunchoke', 7),
  ('Jerusalem Artichoke', 'Native Wild', 'Local wild-type seed tubers', 8)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
