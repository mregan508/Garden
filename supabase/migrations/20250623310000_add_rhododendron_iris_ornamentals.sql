-- Rhododendron, Lily of the Valley, Iris, and Gladiola for Northeast gardens

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Rhododendron',
    'Rhododendron',
    'Partial shade to filtered sun',
    'Regular; acidic moist soil',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Acid-loving shrub; mulch and wind protection in coldest NE winters"}'::jsonb,
    '["Azalea", "Hosta", "Fern"]'::jsonb,
    '["Spring flower clusters", "Evergreen foliage on many cultivars", "Woodland garden anchor"]'::jsonb
  ),
  (
    'Lily of the Valley',
    'Convallaria majalis',
    'Partial to full shade',
    'Regular; rich moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native woodland ground cover; fragrant May bells in NE shade gardens"}'::jsonb,
    '["Hosta", "Fern", "Bleeding Heart"]'::jsonb,
    '["Sweet spring fragrance", "Low spreading ground cover", "Cut flower for small bouquets"]'::jsonb
  ),
  (
    'Iris',
    'Iris',
    'Full sun to partial shade',
    'Moderate; well-drained',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Bearded and Siberian types thrive in NE; divide clumps every few years"}'::jsonb,
    '["Daylily", "Peony", "Catmint"]'::jsonb,
    '["Late spring to early summer bloom", "Vertical sword-like foliage", "Excellent cut flower"]'::jsonb
  ),
  (
    'Gladiola',
    'Gladiolus',
    'Full sun',
    'Regular during growth',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Summer corm; lift and store in coldest NE zones or treat as annual"}'::jsonb,
    '["Dahlia", "Zinnia", "Marigold"]'::jsonb,
    '["Tall summer spikes", "Long-lasting cut flowers", "Wide color range"]'::jsonb
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
  ('Rhododendron', 'PJM Rhododendron', 'Compact lavender-pink; very hardy in NE', 1),
  ('Rhododendron', 'Roseum Elegans', 'Large lavender-pink trusses', 2),
  ('Rhododendron', 'Nova Zembla', 'Deep red flowers; cold hardy', 3),
  ('Rhododendron', 'English Roseum', 'Soft pink classic rhododendron', 4),
  ('Lily of the Valley', 'Standard White', 'Classic fragrant white bells', 1),
  ('Lily of the Valley', 'Rosea', 'Soft pink flowers', 2),
  ('Lily of the Valley', 'Flore Pleno', 'Double white flowers', 3),
  ('Lily of the Valley', 'Variegata', 'White-edged leaves; white flowers', 4),
  ('Iris', 'Siberian Iris', 'Graceful blue-purple; wet soil tolerant', 1),
  ('Iris', 'Bearded Iris', 'Large ruffled blooms; classic garden iris', 2),
  ('Iris', 'Japanese Iris', 'Flat wide petals; loves moisture', 3),
  ('Iris', 'Dutch Iris', 'Sleek spring bulbs; good for cutting', 4),
  ('Gladiola', 'Mixed Pastels', 'Soft pink, peach, and lavender mix', 1),
  ('Gladiola', 'White Prosperity', 'Pure white spikes', 2),
  ('Gladiola', 'Red Majesty', 'Deep red summer glads', 3),
  ('Gladiola', 'Summer Spice', 'Warm red-orange blend', 4)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
