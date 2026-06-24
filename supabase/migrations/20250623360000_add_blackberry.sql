-- Blackberry for Northeast gardens

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Blackberry',
    'Rubus',
    'Full sun',
    'Regular during fruiting; well-drained',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Choose cold-hardy thornless cultivars; trellis or tip primocanes in NE"}'::jsonb,
    '["Grape Vine", "Blueberry", "Serviceberry"]'::jsonb,
    '["Summer fruit for fresh eating and jam", "Thornless types easier to manage", "Attracts pollinators when blooming"]'::jsonb
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
  ('Blackberry', 'Chester', 'Thornless; late season; very hardy in NE', 1),
  ('Blackberry', 'Triple Crown', 'Thornless; large sweet berries', 2),
  ('Blackberry', 'Natchez', 'Thornless; early large fruit', 3),
  ('Blackberry', 'Ouachita', 'Thornless; firm high-quality berries', 4),
  ('Blackberry', 'Arapaho', 'Thornless; erect compact canes', 5),
  ('Blackberry', 'Illini Hardy', 'Cold-hardy; good for colder NE sites', 6),
  ('Blackberry', 'Hull', 'Thornless; heavy producer', 7),
  ('Blackberry', 'Thornless Evergreen', 'Classic thornless trailing type', 8)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
