-- User-requested ornamentals and herbs for Northeast gardens

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Stepping Pink Thyme',
    'Thymus praecox',
    'Full sun',
    'Low; well-drained soil',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Walkable ground cover; pink summer bloom in NE rock gardens"}'::jsonb,
    '["Rosemary", "Lavender", "Sedum"]'::jsonb,
    '["Pink-flowered creeping thyme", "Tolerates light foot traffic", "Drought tolerant once established"]'::jsonb
  ),
  (
    'Perilla',
    'Perilla frutescens',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Warm-season herb; self-seeds in NE gardens"}'::jsonb,
    '["Basil", "Mint", "Tomato"]'::jsonb,
    '["Shiso leaves for sushi and salads", "Purple or green forms", "Attracts pollinators"]'::jsonb
  ),
  (
    'Weeping Crabapple',
    'Malus',
    'Full sun',
    'Regular during establishment',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Ornamental spring bloom; choose fire blight resistant cultivars for humid NE"}'::jsonb,
    '["Catmint", "Daylily", "Hosta"]'::jsonb,
    '["Graceful weeping form", "Spring flowers and small fruit", "Bird-friendly"]'::jsonb
  ),
  (
    'Foxglove',
    'Digitalis purpurea',
    'Partial shade to full sun',
    'Regular; moist soil',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Biennial or short-lived perennial; afternoon shade in hot NE summers"}'::jsonb,
    '["Fern", "Hosta", "Bleeding Heart"]'::jsonb,
    '["Tall spikes of tubular flowers", "Pollinator plant", "Toxic if ingested"]'::jsonb
  ),
  (
    'Solomon''s Seal',
    'Polygonatum biflorum',
    'Partial to full shade',
    'Regular; rich moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native NE woodland perennial; arching stems with white bells"}'::jsonb,
    '["Fern", "Hosta", "Virginia Bluebell"]'::jsonb,
    '["Native shade plant", "Spreads slowly by rhizomes", "Fall golden foliage"]'::jsonb
  ),
  (
    'Jacob''s Ladder',
    'Polemonium caeruleum',
    'Partial shade to full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Cool moist sites; blue spring flowers in NE shade gardens"}'::jsonb,
    '["Hosta", "Astilbe", "Bleeding Heart"]'::jsonb,
    '["Ladder-like leaf arrangement", "Sky-blue or white flowers", "Deer resistant"]'::jsonb
  ),
  (
    'Grape Hyssop',
    'Agastache foeniculum',
    'Full sun',
    'Low to moderate; well-drained',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Anise hyssop; long bloom for NE pollinators"}'::jsonb,
    '["Bee Balm", "Purple Coneflower", "Catmint"]'::jsonb,
    '["Licorice-scented leaves and flowers", "Hummingbird and bee magnet", "Tea herb"]'::jsonb
  ),
  (
    'Hardy Geranium',
    'Geranium',
    'Full sun to partial shade',
    'Moderate',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Cranesbill; not tender pelargonium; long-lived NE perennial"}'::jsonb,
    '["Catmint", "Daylily", "Hosta"]'::jsonb,
    '["Extended bloom season", "Mounding habit", "Low maintenance ground cover or border"]'::jsonb
  ),
  (
    'Blue Mist',
    'Caryopteris x clandonensis',
    'Full sun',
    'Low to moderate; well-drained',
    '{"usda_zones":["5","6","7"],"region_notes":"Bluebeard shrub; late summer color; mulch in coldest NE zones"}'::jsonb,
    '["Catmint", "Sedum", "Ornamental Grass"]'::jsonb,
    '["Blue late-summer flowers", "Butterfly favorite", "Deer resistant"]'::jsonb
  ),
  (
    'Yellow Loosestrife',
    'Lysimachia punctata',
    'Full sun to partial shade',
    'Regular to high; moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Garden loosestrife; spreads by rhizomes—contain in NE beds"}'::jsonb,
    '["Daylily", "Iris", "Hosta"]'::jsonb,
    '["Bright yellow summer spikes", "Wet soil tolerant", "Good cut flower"]'::jsonb
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
  ('Stepping Pink Thyme', 'Pink Chintz', 'Soft pink flowers; mat-forming', 1),
  ('Stepping Pink Thyme', 'Elfin', 'Tiny leaves; tight ground cover', 2),
  ('Stepping Pink Thyme', 'Magic Carpet', 'Pink bloom; walkable thyme', 3),
  ('Stepping Pink Thyme', 'Standard Stepping Pink', 'Classic stepping-stone thyme', 4),
  ('Perilla', 'Green Shiso', 'Green leaves; sushi and pickles', 1),
  ('Perilla', 'Red Shiso', 'Purple-red leaves; ume and color', 2),
  ('Perilla', 'Britton', 'Large leaf; mild flavor', 3),
  ('Perilla', 'Aka Shiso', 'Deep red ornamental form', 4),
  ('Weeping Crabapple', 'Red Jade', 'Weeping with red buds', 1),
  ('Weeping Crabapple', 'Louisa', 'Golden weeping crabapple', 2),
  ('Weeping Crabapple', 'Spring Snow', 'White flowers; fruitless type', 3),
  ('Weeping Crabapple', 'Tina', 'Compact weeping form', 4),
  ('Foxglove', 'Camelot Rose', 'Rose pink spikes', 1),
  ('Foxglove', 'Dalmatian Purple', 'Compact purple', 2),
  ('Foxglove', 'Foxy', 'Mixed pastels; first-year bloom', 3),
  ('Foxglove', 'Alba', 'White flowering foxglove', 4),
  ('Solomon''s Seal', 'Variegatum', 'White-edged leaves', 1),
  ('Solomon''s Seal', 'Native American', 'Polygonatum biflorum native', 2),
  ('Solomon''s Seal', 'Golden', 'Gold variegated form', 3),
  ('Solomon''s Seal', 'Giant', 'Tall Solomon''s seal', 4),
  ('Jacob''s Ladder', 'Blue Pearl', 'Compact blue flowers', 1),
  ('Jacob''s Ladder', 'Brise d''Anjou', 'Variegated white edge', 2),
  ('Jacob''s Ladder', 'White Pearl', 'White flower form', 3),
  ('Jacob''s Ladder', 'Heavenly Habit', 'Large blue clusters', 4),
  ('Grape Hyssop', 'Blue Fortune', 'Compact; long bloom', 1),
  ('Grape Hyssop', 'Black Adder', 'Purple-black flower spikes', 2),
  ('Grape Hyssop', 'Golden Jubilee', 'Chartreuse foliage', 3),
  ('Grape Hyssop', 'Standard Anise Hyssop', 'Classic licorice-scented type', 4),
  ('Hardy Geranium', 'Rozanne', 'Long-blooming blue-purple', 1),
  ('Hardy Geranium', 'Johnson''s Blue', 'Classic blue cranesbill', 2),
  ('Hardy Geranium', 'Biokovo', 'Pale pink; ground cover', 3),
  ('Hardy Geranium', 'Max Frei', 'Magenta; low spreading', 4),
  ('Blue Mist', 'Dark Knight', 'Deep blue flowers', 1),
  ('Blue Mist', 'Beyond Midnight', 'Very dark blue-purple', 2),
  ('Blue Mist', 'Longwood Blue', 'Tall; silvery foliage', 3),
  ('Blue Mist', 'Sunshine Blue', 'Gold foliage; blue flowers', 4),
  ('Yellow Loosestrife', 'Alexander', 'Variegated yellow-green leaves', 1),
  ('Yellow Loosestrife', 'Standard', 'Classic yellow spikes', 2),
  ('Yellow Loosestrife', 'Golden Alexander', 'Gold-edged foliage', 3),
  ('Yellow Loosestrife', 'Firecracker', 'Compact yellow form', 4)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
