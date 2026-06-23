-- Additional fruit trees, ornamentals, and herbs for plant_catalog

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, companion_plants, benefits, medicinal_uses)
VALUES
  (
    'Peach Tree',
    'Prunus persica',
    'Full sun (6–8+ hours)',
    'Regular; deep watering during fruit development',
    '["Comfrey", "Chamomile", "Garlic"]'::jsonb,
    '["Stone fruit", "Spring blossoms", "Needs winter chill in many varieties"]'::jsonb,
    '["Leaves traditionally used in poultices"]'::jsonb
  ),
  (
    'Pear Tree',
    'Pyrus communis',
    'Full sun',
    'Regular; consistent moisture while fruit sets',
    '["Comfrey", "Chamomile", "Nasturtium"]'::jsonb,
    '["Long-lived tree", "Fire blight sensitive; choose resistant cultivars"]'::jsonb,
    NULL
  ),
  (
    'Apple Tree',
    'Malus domestica',
    'Full sun',
    'Regular; avoid drought during fruit swell',
    '["Comfrey", "Chives", "Nasturtium"]'::jsonb,
    '["Requires cross-pollination from another variety in most cases", "Many dwarf rootstocks for small gardens"]'::jsonb,
    NULL
  ),
  (
    'Rose',
    'Rosa',
    'Full sun (6+ hours)',
    'Regular; deep watering; avoid wet foliage',
    '["Garlic", "Chives", "Lavender"]'::jsonb,
    '["Ornamental blooms", "Attracts pollinators", "Prune for air circulation"]'::jsonb,
    '["Rose hips rich in vitamin C"]'::jsonb
  ),
  (
    'Cherry Tree',
    'Prunus avium',
    'Full sun',
    'Regular; consistent moisture during fruit ripening',
    '["Comfrey", "Chamomile", "Garlic"]'::jsonb,
    '["Sweet or sour types; birds love fruit—net if needed", "Early spring blossoms"]'::jsonb,
    NULL
  ),
  (
    'Chamomile',
    'Matricaria chamomilla',
    'Full sun to partial shade',
    'Moderate; allow soil to dry slightly between waterings',
    '["Cabbage", "Onion", "Mint"]'::jsonb,
    '["Attracts beneficial insects", "Self-seeding annual or short-lived perennial"]'::jsonb,
    '["Calming tea from dried flowers"]'::jsonb
  ),
  (
    'Fennel',
    'Foeniculum vulgare',
    'Full sun',
    'Moderate; drought tolerant once established',
    '["Dill", "Coriander"]'::jsonb,
    '["Culinary herb and pollinator magnet", "Do not plant near most vegetables—can inhibit growth"]'::jsonb,
    '["Seeds and fronds aid digestion"]'::jsonb
  ),
  (
    'Fleabane',
    'Erigeron',
    'Full sun to partial shade',
    'Low to moderate; well-drained soil',
    '["Yarrow", "Lavender"]'::jsonb,
    '["Native wildflower", "Drought tolerant", "Supports pollinators"]'::jsonb,
    '["Traditional topical uses for skin irritation"]'::jsonb
  ),
  (
    'Mullein',
    'Verbascum thapsus',
    'Full sun',
    'Low; prefers dry, poor soils once established',
    '["Yarrow", "Echinacea"]'::jsonb,
    '["Biennial with tall flower spike", "Self-seeds readily"]'::jsonb,
    '["Leaves traditionally used for respiratory support"]'::jsonb
  ),
  (
    'Lilac',
    'Syringa vulgaris',
    'Full sun (6+ hours)',
    'Moderate; reduce after establishment',
    '["Peony", "Clematis"]'::jsonb,
    '["Fragrant spring blooms", "Deciduous shrub or small tree"]'::jsonb,
    NULL
  ),
  (
    'Bleeding Heart',
    'Lamprocapnos spectabilis',
    'Partial shade to full shade',
    'Regular; keep soil moist but not soggy',
    '["Fern", "Hosta", "Astilbe"]'::jsonb,
    '["Shade perennial", "Distinctive heart-shaped spring flowers", "Dies back in summer heat"]'::jsonb,
    NULL
  )
ON CONFLICT ((lower(common_name))) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  light_requirements = EXCLUDED.light_requirements,
  water_needs = EXCLUDED.water_needs,
  companion_plants = EXCLUDED.companion_plants,
  benefits = EXCLUDED.benefits,
  medicinal_uses = EXCLUDED.medicinal_uses,
  updated_at = now();
