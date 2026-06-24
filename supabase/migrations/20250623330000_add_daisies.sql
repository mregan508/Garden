-- Daisies for Northeast gardens

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Daisies',
    'Leucanthemum',
    'Full sun to partial shade',
    'Moderate; well-drained',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Shasta and oxeye types common in NE borders; deadhead for longer summer bloom"}'::jsonb,
    '["Catmint", "Daylily", "Purple Coneflower"]'::jsonb,
    '["Cheerful white summer flowers", "Long bloom with deadheading", "Cut flower and pollinator plant"]'::jsonb
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
  ('Daisies', 'Shasta Daisy', 'Classic large white summer daisy', 1),
  ('Daisies', 'Becky', 'Tall Shasta; sturdy and long-blooming', 2),
  ('Daisies', 'English Daisy', 'Low spring daisy; lawn and edge plant', 3),
  ('Daisies', 'Oxeye Daisy', 'Wild white meadow daisy; naturalistic plantings', 4)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
