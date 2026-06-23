-- Expand plant_catalog from 50 to 100; Northeast US edibles, natives, and ornamentals

INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
  (
    'Brandywine Tomato',
    'Solanum lycopersicum',
    'Full sun (6–8+ hours)',
    'Regular; even moisture',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Large heirloom; needs long NE summer and staking"}'::jsonb,
    '["Basil", "Marigold", "Carrot"]'::jsonb,
    '["Indeterminate heirloom", "Rich flavor for slicing", "Start indoors 6–8 weeks before last frost"]'::jsonb
  ),
  (
    'Cherry Tomato',
    'Solanum lycopersicum var. cerasiforme',
    'Full sun',
    'Regular',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Sungold and Sweet 100 ripen reliably in NE"}'::jsonb,
    '["Basil", "Borage", "Marigold"]'::jsonb,
    '["Prolific small fruit", "Great for containers", "Splitting common with uneven watering"]'::jsonb
  ),
  (
    'Jalapeño Pepper',
    'Capsicum annuum',
    'Full sun',
    'Regular; consistent moisture',
    '{"usda_zones":["5","6","7"],"region_notes":"Start indoors; transplant after frost in NE"}'::jsonb,
    '["Basil", "Tomato", "Carrot"]'::jsonb,
    '["Warm-season crop", "Green or red harvest", "Good for pickling"]'::jsonb
  ),
  (
    'Eggplant',
    'Solanum melongena',
    'Full sun',
    'Regular; heat-loving',
    '{"usda_zones":["5","6","7"],"region_notes":"Black Beauty and Japanese types need warm NE summers"}'::jsonb,
    '["Bean", "Marigold", "Thyme"]'::jsonb,
    '["Use row cover early season", "Heavy feeder", "Harvest before skin dulls"]'::jsonb
  ),
  (
    'Radish',
    'Raphanus sativus',
    'Full sun to partial shade',
    'Regular; keep moist for mild flavor',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Fast spring and fall crop in cool NE soil"}'::jsonb,
    '["Carrot", "Lettuce", "Pea"]'::jsonb,
    '["Ready in 3–4 weeks", "Loosen soil for round roots", "Bolts in hot weather"]'::jsonb
  ),
  (
    'Turnip',
    'Brassica rapa',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Fall harvest sweetens after light frost"}'::jsonb,
    '["Pea", "Onion", "Mint"]'::jsonb,
    '["Roots and greens edible", "Succession sow late summer", "Clubroot rotation important"]'::jsonb
  ),
  (
    'Parsnip',
    'Pastinaca sativa',
    'Full sun',
    'Regular; deep loose soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Overwinter in ground; harvest early spring NE tradition"}'::jsonb,
    '["Onion", "Radish", "Pea"]'::jsonb,
    '["Slow germination", "Sweetens after frost", "Long taproot needs stone-free bed"]'::jsonb
  ),
  (
    'Leek',
    'Allium ampeloprasum',
    'Full sun',
    'Regular; hill soil for blanched stems',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Start indoors; transplant for fall harvest"}'::jsonb,
    '["Carrot", "Celery", "Onion"]'::jsonb,
    '["Cold hardy into late fall", "Mulch for extended harvest", "Mild onion flavor"]'::jsonb
  ),
  (
    'Scallion',
    'Allium fistulosum',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Bunching onion; direct sow spring and summer"}'::jsonb,
    '["Carrot", "Tomato", "Lettuce"]'::jsonb,
    '["Cut-and-come-again greens", "No bulb formation", "Quick crop from seed"]'::jsonb
  ),
  (
    'Brussels Sprouts',
    'Brassica oleracea var. gemmifera',
    'Full sun',
    'Regular; consistent moisture',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Flavor improves after frost; long-season NE crop"}'::jsonb,
    '["Onion", "Dill", "Potato"]'::jsonb,
    '["Top leaves edible too", "Stake tall plants", "Protect from cabbage worms"]'::jsonb
  ),
  (
    'Cauliflower',
    'Brassica oleracea var. botrytis',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Spring or fall; blanch heads in sun"}'::jsonb,
    '["Bean", "Celery", "Onion"]'::jsonb,
    '["Sensitive to temperature swings", "Purple and romanesco types available", "Heavy feeder"]'::jsonb
  ),
  (
    'Kohlrabi',
    'Brassica oleracea var. gongylodes',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Fast cool-season crop; spring and fall in NE"}'::jsonb,
    '["Onion", "Cucumber", "Beet"]'::jsonb,
    '["Bulb stem edible raw or cooked", "Harvest at tennis-ball size", "Few pest issues"]'::jsonb
  ),
  (
    'Collard Greens',
    'Brassica oleracea var. viridis',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Very cold hardy; harvest into late fall NE"}'::jsonb,
    '["Onion", "Dill", "Potato"]'::jsonb,
    '["Cut outer leaves continuously", "Improves after light frost", "High in vitamins"]'::jsonb
  ),
  (
    'Arugula',
    'Eruca vesicaria',
    'Partial shade to full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Spring and fall; bolts quickly in NE summer heat"}'::jsonb,
    '["Lettuce", "Carrot", "Beet"]'::jsonb,
    '["Peppery salad green", "Succession sow every 2 weeks", "Self-seeds readily"]'::jsonb
  ),
  (
    'Bok Choy',
    'Brassica rapa subsp. chinensis',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Quick fall crop; flea beetle watch in NE"}'::jsonb,
    '["Onion", "Celery", "Bean"]'::jsonb,
    '["Baby or full size harvest", "Stir-fry staple", "40–50 days to maturity"]'::jsonb
  ),
  (
    'Acorn Squash',
    'Cucurbita pepo',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Compact winter squash for NE gardens"}'::jsonb,
    '["Corn", "Bean", "Nasturtium"]'::jsonb,
    '["Stores 1–2 months", "Bush and vining types", "Harvest before hard frost"]'::jsonb
  ),
  (
    'Delicata Squash',
    'Cucurbita pepo',
    'Full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Sweet thin-skinned squash; shorter season than butternut"}'::jsonb,
    '["Corn", "Bean", "Marigold"]'::jsonb,
    '["Edible skin when roasted", "Good keeper", "Single-serving size fruit"]'::jsonb
  ),
  (
    'Sugar Baby Watermelon',
    'Citrullus lanatus',
    'Full sun',
    'High during fruit development',
    '{"usda_zones":["5","6","7"],"region_notes":"Short-season icebox type for warm NE summers"}'::jsonb,
    '["Corn", "Radish", "Marigold"]'::jsonb,
    '["Black plastic mulch helps warm soil", "Harvest when tendril dries", "Needs space to sprawl"]'::jsonb
  ),
  (
    'Cantaloupe',
    'Cucumis melo',
    'Full sun',
    'Regular to high',
    '{"usda_zones":["5","6","7"],"region_notes":"Ambrosia and Hale''s Best for northern gardens"}'::jsonb,
    '["Corn", "Radish", "Marigold"]'::jsonb,
    '["Slips from stem when ripe", "Aromatic at maturity", "Warm soil required"]'::jsonb
  ),
  (
    'Edamame',
    'Glycine max',
    'Full sun',
    'Regular',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Short-season soybean; harvest green pods in NE"}'::jsonb,
    '["Corn", "Cucumber", "Potato"]'::jsonb,
    '["Nitrogen fixer", "Boil pods and salt", "Plant after soil warms"]'::jsonb
  ),
  (
    'Highbush Cranberry',
    'Viburnum trilobum',
    'Full sun to partial shade',
    'Regular; tolerates moist soil',
    '{"usda_zones":["2","3","4","5","6","7"],"region_notes":"Native viburnum; tart fruit for jelly"}'::jsonb,
    '["Serviceberry", "Elderberry"]'::jsonb,
    '["Wildlife shrub", "White lacecap flowers in spring", "Not true cranberry but similar use"]'::jsonb
  ),
  (
    'Black Currant',
    'Ribes nigrum',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Check local restrictions; some NE states limit Ribes"}'::jsonb,
    '["Gooseberry", "Chives"]'::jsonb,
    '["High in vitamin C", "Shade tolerant fruit", "Prune old wood annually"]'::jsonb
  ),
  (
    'Gooseberry',
    'Ribes uva-crispa',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardy shrub; mildew-resistant cultivars for humid NE"}'::jsonb,
    '["Currant", "Chives"]'::jsonb,
    '["Thorny canes; wear gloves", "Pie and jam fruit", "Partial shade reduces leaf scorch"]'::jsonb
  ),
  (
    'Serviceberry',
    'Amelanchier canadensis',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native multi-stem shrub; early spring bloom"}'::jsonb,
    '["Elderberry", "Highbush Cranberry"]'::jsonb,
    '["Edible berries taste like blueberry-almond", "Fall foliage color", "Birds love fruit"]'::jsonb
  ),
  (
    'American Plum',
    'Prunus americana',
    'Full sun',
    'Moderate; drought tolerant once established',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native wild plum; pollinator and wildlife tree"}'::jsonb,
    '["Comfrey", "Chamomile"]'::jsonb,
    '["Suckering habit", "Tart fruit for jam", "Thorny branches"]'::jsonb
  ),
  (
    'Honeycrisp Apple',
    'Malus domestica',
    'Full sun',
    'Regular during fruit swell',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Popular NE apple; needs pollinator variety nearby"}'::jsonb,
    '["Chives", "Nasturtium", "Comfrey"]'::jsonb,
    '["Crisp sweet-tart fruit", "Thin skin bruises easily", "Midseason harvest"]'::jsonb
  ),
  (
    'Montmorency Cherry',
    'Prunus cerasus',
    'Full sun',
    'Regular during ripening',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Classic sour pie cherry for NE orchards"}'::jsonb,
    '["Comfrey", "Garlic", "Chamomile"]'::jsonb,
    '["Self-fertile sour cherry", "Bird netting recommended", "Beautiful spring bloom"]'::jsonb
  ),
  (
    'Cranberry',
    'Vaccinium macrocarpon',
    'Full sun',
    'High; acidic wet soil or bog conditions',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native bog plant; container bog gardens work in NE"}'::jsonb,
    '["Blueberry", "Rhododendron"]'::jsonb,
    '["Requires pH 4.0–5.5", "Evergreen ground cover", "Commercial NE crop in Massachusetts"]'::jsonb
  ),
  (
    'Pawpaw',
    'Asimina triloba',
    'Partial shade to full sun',
    'Regular when young',
    '{"usda_zones":["5","6","7"],"region_notes":"Native fruit tree; needs two genetics for pollination"}'::jsonb,
    '["Comfrey", "Fern"]'::jsonb,
    '["Tropical-flavor fruit", "Larval host for zebra swallowtail", "Slow to establish"]'::jsonb
  ),
  (
    'Red Currant',
    'Ribes rubrum',
    'Partial shade to full sun',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Less restricted than black currant in many NE states"}'::jsonb,
    '["Gooseberry", "Chives"]'::jsonb,
    '["Clusters of tart berries", "Jelly and fresh eating", "Few pests"]'::jsonb
  ),
  (
    'Flat-Leaf Parsley',
    'Petroselinum crispum',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Biennial; often grown as annual in NE"}'::jsonb,
    '["Tomato", "Asparagus", "Carrot"]'::jsonb,
    '["Slow germination; soak seeds", "Swallowtail host plant", "Cut outer stems first"]'::jsonb
  ),
  (
    'Cilantro',
    'Coriandrum sativum',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Succession sow; bolts quickly in NE heat"}'::jsonb,
    '["Anise", "Spinach", "Tomato"]'::jsonb,
    '["Leaves and seeds (coriander) edible", "Cool-season herb", "Attracts beneficial insects"]'::jsonb
  ),
  (
    'Creeping Thyme',
    'Thymus serpyllum',
    'Full sun',
    'Low; well-drained soil',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Hardy ground cover herb; mulch in cold NE winters"}'::jsonb,
    '["Rosemary", "Sage", "Strawberry"]'::jsonb,
    '["Walkable ground cover", "Pollinator plant", "Drought tolerant once established"]'::jsonb
  ),
  (
    'Greek Oregano',
    'Origanum vulgare subsp. hirtum',
    'Full sun',
    'Low to moderate',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Perennial in sheltered NE sites; pot and overwinter in zone 5"}'::jsonb,
    '["Basil", "Pepper", "Cabbage"]'::jsonb,
    '["Strong flavor when dried", "White summer flowers", "Divide every 3 years"]'::jsonb
  ),
  (
    'Lemon Balm',
    'Melissa officinalis',
    'Full sun to partial shade',
    'Moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardy mint family; contain to prevent spread"}'::jsonb,
    '["Squash", "Fruit trees"]'::jsonb,
    '["Calming tea herb", "Self-seeds freely", "Repels some insects"]'::jsonb
  ),
  (
    'Catmint',
    'Nepeta faassenii',
    'Full sun',
    'Low to moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardy perennial; reblooms if sheared in NE summer"}'::jsonb,
    '["Rose", "Peony", "Echinacea"]'::jsonb,
    '["Pollinator favorite", "Deer resistant", "Gray-green aromatic foliage"]'::jsonb
  ),
  (
    'Bee Balm',
    'Monarda didyma',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Native mint relative; powdery mildew in humid NE—choose resistant cultivars"}'::jsonb,
    '["Purple Coneflower", "Black-Eyed Susan"]'::jsonb,
    '["Hummingbird magnet", "Edible petals and tea", "Spreads by rhizomes"]'::jsonb
  ),
  (
    'French Tarragon',
    'Artemisia dracunculus',
    'Full sun',
    'Moderate; well-drained soil',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Not winter-hardy in coldest NE; mulch heavily or pot indoors"}'::jsonb,
    '["Eggplant", "Cabbage", "Thyme"]'::jsonb,
    '["Propagate by division not seed", "Classic culinary herb", "Avoid Russian tarragon (inferior flavor)"]'::jsonb
  ),
  (
    'Black-Eyed Susan',
    'Rudbeckia hirta',
    'Full sun',
    'Low to moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native short-lived perennial; self-seeds in NE gardens"}'::jsonb,
    '["Purple Coneflower", "Bee Balm", "Ornamental Grass"]'::jsonb,
    '["Long bloom period", "Goldfinches eat seeds", "Low maintenance"]'::jsonb
  ),
  (
    'Astilbe',
    'Astilbe chinensis',
    'Partial to full shade',
    'High; consistently moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Shade perennial for moist NE woodland edges"}'::jsonb,
    '["Hosta", "Fern", "Bleeding Heart"]'::jsonb,
    '["Plume flowers in summer", "Deer resistant", "Divide clumps every 4 years"]'::jsonb
  ),
  (
    'Winterberry Holly',
    'Ilex verticillata',
    'Full sun to partial shade',
    'Regular to high; tolerates wet soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native deciduous holly; needs male pollinator for berries"}'::jsonb,
    '["Red Twig Dogwood", "Serviceberry"]'::jsonb,
    '["Bright red winter berries", "Bird food source", "Native wetland shrub"]'::jsonb
  ),
  (
    'Panicle Hydrangea',
    'Hydrangea paniculata',
    'Full sun to partial shade',
    'Regular',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Hardiest hydrangea for NE; blooms on new wood"}'::jsonb,
    '["Hosta", "Daylily", "Catmint"]'::jsonb,
    '["Limelight and Quick Fire popular cultivars", "Late summer bloom", "Prune in late winter"]'::jsonb
  ),
  (
    'Ostrich Fern',
    'Matteuccia struthiopteris',
    'Partial to full shade',
    'High; rich moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native NE fern; fiddleheads edible in spring"}'::jsonb,
    '["Hosta", "Astilbe", "Bleeding Heart"]'::jsonb,
    '["Spreads by rhizomes", "Architectural fronds", "Harvest fiddleheads when tightly coiled"]'::jsonb
  ),
  (
    'Daylily',
    'Hemerocallis fulva',
    'Full sun to partial shade',
    'Moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Extremely hardy; thousands of cultivars for NE gardens"}'::jsonb,
    '["Catmint", "Sedum", "Peony"]'::jsonb,
    '["Each flower lasts one day", "Edible buds in stir-fry", "Drought tolerant once established"]'::jsonb
  ),
  (
    'Autumn Joy Sedum',
    'Hylotelephium spectabile',
    'Full sun',
    'Low; drought tolerant',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Succulent perennial; late-season NE pollinator plant"}'::jsonb,
    '["Ornamental Grass", "Purple Coneflower"]'::jsonb,
    '["Pink bronze fall flowers", "Leave stems for winter interest", "Rabbit resistant"]'::jsonb
  ),
  (
    'Coral Bells',
    'Heuchera americana',
    'Partial shade to full sun',
    'Moderate',
    '{"usda_zones":["4","5","6","7"],"region_notes":"Native Heuchera; foliage color varieties for NE shade gardens"}'::jsonb,
    '["Hosta", "Fern", "Astilbe"]'::jsonb,
    '["Evergreen foliage in mild winters", "Spires of tiny flowers", "Heaving risk—mulch in zone 4"]'::jsonb
  ),
  (
    'Virginia Bluebell',
    'Mertensia virginica',
    'Partial to full shade',
    'Regular; moist soil',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native spring ephemeral; goes dormant by midsummer NE"}'::jsonb,
    '["Fern", "Bleeding Heart", "Hosta"]'::jsonb,
    '["Sky-blue spring flowers", "Self-seeds in woodland gardens", "Plant with summer companions"]'::jsonb
  ),
  (
    'Butterfly Milkweed',
    'Asclepias tuberosa',
    'Full sun',
    'Low to moderate; well-drained',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native milkweed; monarch host plant for NE migrations"}'::jsonb,
    '["Purple Coneflower", "Black-Eyed Susan"]'::jsonb,
    '["Orange summer blooms", "Do not disturb taproot when transplanting", "Toxic if ingested in quantity"]'::jsonb
  ),
  (
    'New England Aster',
    'Symphyotrichum novae-angliae',
    'Full sun',
    'Moderate',
    '{"usda_zones":["3","4","5","6","7"],"region_notes":"Native late-season nectar for NE pollinators"}'::jsonb,
    '["Goldenrod", "Joe-Pye Weed"]'::jsonb,
    '["Purple fall flowers", "Pinch back before July 4 for bushier plants", "Supports migrating butterflies"]'::jsonb
  ),
  (
    'Red Twig Dogwood',
    'Cornus sericea',
    'Full sun to partial shade',
    'Regular to high; tolerates wet soil',
    '{"usda_zones":["2","3","4","5","6","7"],"region_notes":"Native shrub; red stems show best in NE winter sun"}'::jsonb,
    '["Winterberry Holly", "Serviceberry"]'::jsonb,
    '["Cut old stems for brightest color", "White spring flowers", "Erosion control on wet sites"]'::jsonb
  )
ON CONFLICT ((lower(common_name))) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  light_requirements = EXCLUDED.light_requirements,
  water_needs = EXCLUDED.water_needs,
  climate_preferences = EXCLUDED.climate_preferences,
  companion_plants = EXCLUDED.companion_plants,
  benefits = EXCLUDED.benefits,
  updated_at = now();
