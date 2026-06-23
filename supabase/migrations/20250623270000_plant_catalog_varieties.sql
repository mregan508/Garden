-- Cultivars / subspecies per catalog species; optional link from map pins

CREATE TABLE plant_catalog_variety (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_catalog_id  UUID NOT NULL REFERENCES plant_catalog(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_plant_catalog_variety_catalog_name
  ON plant_catalog_variety (plant_catalog_id, lower(name));

CREATE INDEX idx_plant_catalog_variety_catalog_id ON plant_catalog_variety(plant_catalog_id);

CREATE OR REPLACE FUNCTION update_plant_catalog_variety_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plant_catalog_variety_updated_at
  BEFORE UPDATE ON plant_catalog_variety
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_catalog_variety_updated_at();

ALTER TABLE plant_catalog_variety ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read catalog varieties" ON plant_catalog_variety
  FOR SELECT TO authenticated USING (true);

ALTER TABLE garden_placements
  ADD COLUMN plant_catalog_variety_id UUID REFERENCES plant_catalog_variety(id) ON DELETE SET NULL;

CREATE INDEX idx_garden_placements_variety_id ON garden_placements(plant_catalog_variety_id);

-- Generic grape species for variety picker (Concord remains as its own catalog shortcut)
INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES (
  'Grape Vine',
  'Vitis',
  'Full sun',
  'Regular during fruit development',
  '{"usda_zones":["4","5","6","7"],"region_notes":"Choose cold-hardy cultivars for NE; trellis required"}'::jsonb,
  '["Rose", "Garlic", "Chives"]'::jsonb,
  '["Table, juice, or wine grapes", "Needs annual pruning"]'::jsonb
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
  ('Apple Tree', 'Honeycrisp', 'Crisp, sweet-tart; popular NE apple', 1),
  ('Apple Tree', 'McIntosh', 'Classic NE apple; soft, aromatic', 2),
  ('Apple Tree', 'Cortland', 'Slow browning; good for salads', 3),
  ('Apple Tree', 'Liberty', 'Disease-resistant; low-spray option', 4),
  ('Apple Tree', 'Fuji', 'Very sweet; stores well', 5),
  ('Apple Tree', 'Gala', 'Early; sweet and mild', 6),
  ('Apple Tree', 'Granny Smith', 'Tart green; late season', 7),
  ('Apple Tree', 'Golden Delicious', 'All-purpose yellow apple', 8),
  ('Apple Tree', 'Red Delicious', 'Sweet; classic red skin', 9),
  ('Apple Tree', 'Pink Lady', 'Firm, tangy-sweet; late harvest', 10),
  ('Pear Tree', 'Bartlett', 'Classic soft pear; summer ripening', 1),
  ('Pear Tree', 'Bosc', 'Firm, russeted; good for baking', 2),
  ('Pear Tree', 'Anjou', 'Mild, versatile green or red', 3),
  ('Pear Tree', 'Comice', 'Buttery dessert pear', 4),
  ('Pear Tree', 'Seckel', 'Small, very sweet', 5),
  ('Pear Tree', 'Asian (Shinseiki)', 'Crisp Asian pear; fire blight watch', 6),
  ('Peach Tree', 'Redhaven', 'Reliable NE peach; freestone', 1),
  ('Peach Tree', 'Contender', 'Cold-hardy; late bloom avoids frost', 2),
  ('Peach Tree', 'Elberta', 'Classic freestone peach', 3),
  ('Peach Tree', 'Reliance', 'Hardy; good for colder sites', 4),
  ('Peach Tree', 'Belle of Georgia', 'White-fleshed; sweet', 5),
  ('Peach Tree', 'Saturn (Donut)', 'Flat donut peach', 6),
  ('Mint', 'Peppermint', 'Classic minty flavor; teas and cooking', 1),
  ('Mint', 'Spearmint', 'Milder; mojitos and salads', 2),
  ('Mint', 'Chocolate Mint', 'Mint with chocolate undertone', 3),
  ('Mint', 'Apple Mint', 'Fuzzy leaves; fruity aroma', 4),
  ('Mint', 'Pineapple Mint', 'Variegated; tropical note', 5),
  ('Mint', 'Orange Mint', 'Citrus-scented', 6),
  ('Mint', 'Moroccan Mint', 'Traditional for tea', 7),
  ('Grape Vine', 'Concord', 'Classic NE juice and jelly grape', 1),
  ('Grape Vine', 'Niagara', 'White Concord-type; sweet juice', 2),
  ('Grape Vine', 'Catawba', 'Pink slip-skin; wine and juice', 3),
  ('Grape Vine', 'Marquette', 'Cold-hardy red wine grape', 4),
  ('Grape Vine', 'Frontenac', 'Hardy red; wine or juice', 5),
  ('Grape Vine', 'Reliance', 'Seedless table grape for NE', 6),
  ('Grape Vine', 'Mars', 'Seedless blue; table grape', 7),
  ('Tomato', 'Roma', 'Paste tomato; dense flesh', 1),
  ('Tomato', 'Beefsteak', 'Large slicing tomato', 2),
  ('Tomato', 'Cherry (Sungold)', 'Sweet orange cherry type', 3),
  ('Tomato', 'Heirloom (Brandywine)', 'Large pink heirloom', 4),
  ('Tomato', 'San Marzano', 'Italian paste type', 5),
  ('Blueberry', 'Highbush (Bluecrop)', 'Standard NE highbush', 1),
  ('Blueberry', 'Highbush (Jersey)', 'Late-season; high yield', 2),
  ('Blueberry', 'Half-High (Northblue)', 'Compact; cold hardy', 3),
  ('Blueberry', 'Half-High (Northcountry)', 'Small sweet berries', 4),
  ('Rose', 'Knock Out', 'Low-maintenance landscape rose', 1),
  ('Rose', 'Climbing (New Dawn)', 'Repeat-blooming climber', 2),
  ('Rose', 'Hybrid Tea', 'Classic cut-flower form', 3),
  ('Rose', 'Shrub (Easy Elegance)', 'Disease-resistant shrub rose', 4)
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
