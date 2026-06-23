-- Expand plant_catalog to 50 entries; Northeast US–friendly edibles, natives, and ornamentals

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Concord Grape',
    'Vitis labrusca',
    'Full sun',
    'Regular; deep roots once established',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Classic Northeast labrusca grape; cold hardy"}'::jsonb,
    '["Hyssop", "Basil", "Garlic"]'::jsonb,
    '["Native-derived cultivar", "Excellent for juice and jelly", "Train on trellis or arbor"]'::jsonb
  ),
  (
    'Red Raspberry',
    'Rubus idaeus',
    'Full sun to partial shade',
    'Regular; consistent moisture during fruiting',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Heritage and Latham types thrive in cool NE summers"}'::jsonb,
    '["Garlic", "Tansy"]'::jsonb,
    '["Summer-bearing or everbearing cultivars", "Prune old canes annually", "Bird netting recommended"]'::jsonb
  ),
  (
    'Rhubarb',
    'Rheum rhabarbarum',
    'Full sun to partial shade',
    'Regular; rich moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Cold-hardy perennial; NE spring staple"}'::jsonb,
    '["Strawberry", "Cabbage", "Bean"]'::jsonb,
    '["Perennial vegetable", "Harvest stalks not leaves (toxic)", "Divide crowns every 5–8 years"]'::jsonb
  ),
  (
    'Asparagus',
    'Asparagus officinalis',
    'Full sun',
    'Regular when young; moderate once established',
    '{"usda_zones":["3","4","5","6","7","8"],"region_notes":"Long-lived NE perennial; plant crowns in spring"}'::jsonb,
    '["Parsley", "Tomato", "Basil"]'::jsonb,
    '["Do not harvest first 2 years", "Male cultivars (Jersey series) resist rust", "20+ year bed possible"]'::jsonb
  ),
  (
    'Butternut Squash',
    'Cucurbita moschata',
    'Full sun',
    'Regular; reduce when fruit ripens',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Stores well through NE winter"}'::jsonb,
    '["Corn", "Bean", "Marigold"]'::jsonb,
    '["Winter squash", "Cure fruit 2 weeks before storage", "Vining; needs space"]'::jsonb
  ),
  (
    'Sugar Pumpkin',
    'Cucurbita pepo',
    'Full sun',
    'Regular to high during fruit set',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Short-season pie pumpkin for NE gardens"}'::jsonb,
    '["Corn", "Bean", "Nasturtium"]'::jsonb,
    '["Compact vines available", "Harvest when rind hard and stem dry"]'::jsonb
  ),
  (
    'Sweet Corn',
    'Zea mays',
    'Full sun',
    'Regular; critical during tasseling',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Plant after soil warms; block planting for pollination"}'::jsonb,
    '["Bean", "Pea", "Cucumber"]'::jsonb,
    '["Heavy feeder", "Plant in blocks not single rows", "Succession plant for longer harvest"]'::jsonb
  ),
  (
    'Broccoli',
    'Brassica oleracea var. italica',
    'Full sun',
    'Regular; consistent moisture',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Spring and fall crop in NE; bolts in hot midsummer"}'::jsonb,
    '["Onion", "Dill", "Potato"]'::jsonb,
    '["Cool-season brassica", "Side shoots after main head cut", "Cover from cabbage worms"]'::jsonb
  ),
  (
    'Green Cabbage',
    'Brassica oleracea var. capitata',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Early Jersey Wakefield and Golden Acre suit NE"}'::jsonb,
    '["Onion", "Garlic", "Dill"]'::jsonb,
    '["Stores for winter sauerkraut", "Tolerates light frost", "Rotate away from other brassicas"]'::jsonb
  ),
  (
    'Yellow Onion',
    'Allium cepa',
    'Full sun',
    'Regular until bulbs mature; then dry down',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Long-day types for northern latitudes"}'::jsonb,
    '["Carrot", "Beet", "Lettuce"]'::jsonb,
    '["Plant sets or transplants in spring", "Cure before storage", "Pest deterrent companion"]'::jsonb
  ),
  (
    'Hardneck Garlic',
    'Allium sativum',
    'Full sun',
    'Moderate; avoid waterlogged soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Plant cloves in fall for NE harvest next July"}'::jsonb,
    '["Rose", "Tomato", "Carrot"]'::jsonb,
    '["Rocambole and porcelain types cold hardy", "Scapes edible in June", "Mulch heavily for winter"]'::jsonb
  ),
  (
    'Yukon Gold Potato',
    'Solanum tuberosum',
    'Full sun',
    'Regular; even moisture while tubers form',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Midseason yellow potato widely grown in NE"}'::jsonb,
    '["Bean", "Corn", "Cabbage"]'::jsonb,
    '["Hill soil as plants grow", "Colorado potato beetle watch", "Plant seed potatoes eyes up"]'::jsonb
  ),
  (
    'Beet',
    'Beta vulgaris',
    'Full sun to partial shade',
    'Regular; do not let soil dry out',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Detroit Dark Red and golden types suit cool NE soil"}'::jsonb,
    '["Onion", "Lettuce", "Brassica"]'::jsonb,
    '["Roots and greens edible", "Succession sow spring through summer", "Tolerates frost"]'::jsonb
  ),
  (
    'Swiss Chard',
    'Beta vulgaris subsp. vulgaris',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Bright Lights tolerates heat and cool NE springs"}'::jsonb,
    '["Bean", "Cabbage", "Onion"]'::jsonb,
    '["Cut-and-come-again greens", "Ornamental and edible", "Few pest issues"]'::jsonb
  ),
  (
    'Dill',
    'Anethum graveolens',
    'Full sun',
    'Moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Self-seeds in NE herb gardens"}'::jsonb,
    '["Cabbage", "Cucumber", "Onion"]'::jsonb,
    '["Attracts beneficial wasps", "Bolts in hot weather; succession sow", "Host for swallowtail caterpillars"]'::jsonb
  ),
  (
    'Common Sage',
    'Salvia officinalis',
    'Full sun',
    'Low to moderate; well-drained soil',
    '{"usda_zones":["4","5","6","7","8"],"region_notes":"Hardy perennial herb in protected NE sites; mulch in zone 5"}'::jsonb,
    '["Rosemary", "Cabbage", "Carrot"]'::jsonb,
    '["Evergreen in mild winters", "Culinary and pollinator plant", "Replace every 4–5 years"]'::jsonb
  ),
  (
    'Chives',
    'Allium schoenoprasum',
    'Full sun to partial shade',
    'Moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardy NE perennial; first herb to green up in spring"}'::jsonb,
    '["Carrot", "Tomato", "Rose"]'::jsonb,
    '["Edible flowers", "Divide clumps every 3 years", "Repels some pests"]'::jsonb
  ),
  (
    'Hosta',
    'Hosta sieboldiana',
    'Partial to full shade',
    'Regular; prefers moist rich soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Staple shade perennial under NE trees"}'::jsonb,
    '["Fern", "Astilbe", "Bleeding Heart"]'::jsonb,
    '["Slug control needed in wet NE summers", "Many leaf sizes and colors", "Low maintenance once established"]'::jsonb
  ),
  (
    'Garden Peony',
    'Paeonia lactiflora',
    'Full sun (6+ hours)',
    'Moderate; avoid soggy winter soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Long-lived NE favorite; ants on buds are normal"}'::jsonb,
    '["Rose", "Lilac", "Catmint"]'::jsonb,
    '["Plant crowns shallow", "May take 2–3 years to bloom fully", "Supports heavy flowers with stakes"]'::jsonb
  ),
  (
    'Elderberry',
    'Sambucus canadensis',
    'Full sun to partial shade',
    'Regular; tolerates wet soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native shrub; Adams and York pairs for fruit set"}'::jsonb,
    '["Comfrey", "Yarrow"]'::jsonb,
    '["Berries for syrup and wine", "Wildlife food source", "Cook berries before eating"]'::jsonb
  ),
  (
    'Purple Coneflower',
    'Echinacea purpurea',
    'Full sun',
    'Low to moderate; drought tolerant once established',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native prairie species naturalized in NE gardens"}'::jsonb,
    '["Black-Eyed Susan", "Bee Balm", "Ornamental Grass"]'::jsonb,
    '["Pollinator magnet", "Seed heads feed goldfinches", "Self-seeds moderately"]'::jsonb
  )
ON CONFLICT ((lower(common_name))) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  light_requirements = EXCLUDED.light_requirements,
  water_needs = EXCLUDED.water_needs,
  climate_preferences = EXCLUDED.climate_preferences,
  companion_plants = EXCLUDED.companion_plants,
  benefits = EXCLUDED.benefits,
  updated_at = now();
