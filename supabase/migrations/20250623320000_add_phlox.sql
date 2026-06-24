-- Phlox for Northeast gardens

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Phlox',
    'Phlox',
    'Full sun to partial shade',
    'Moderate; well-drained',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Creeping and garden phlox staples in NE borders; powdery mildew resistance matters in humid summers"}'::jsonb,
    '["Daylily", "Catmint", "Hosta"]'::jsonb,
    '["Spring through summer color", "Pollinator favorite", "Ground cover to tall border options"]'::jsonb
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
  ('Phlox', 'Creeping Phlox', 'Moss-pink mat; early spring color on rocks and edges', 1),
  ('Phlox', 'Garden Phlox', 'Tall summer panicles; classic border phlox', 2),
  ('Phlox', 'Woodland Phlox', 'Native blue-lavender; part shade ground cover', 3),
  ('Phlox', 'David', 'White garden phlox; mildew resistant', 4)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
