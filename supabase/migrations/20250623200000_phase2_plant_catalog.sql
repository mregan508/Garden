-- Phase 2: plant catalog reference data + optional link from placements

CREATE TABLE plant_catalog (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name          TEXT NOT NULL,
  scientific_name      TEXT,
  light_requirements   TEXT,
  water_needs          TEXT,
  climate_preferences  JSONB,
  nutritional_needs    JSONB,
  companion_plants     JSONB,
  benefits             JSONB,
  medicinal_uses       JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_plant_catalog_common_name ON plant_catalog (lower(common_name));

COMMENT ON TABLE plant_catalog IS 'Reference plant database for garden map pins';

CREATE OR REPLACE FUNCTION update_plant_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plant_catalog_updated_at
  BEFORE UPDATE ON plant_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_catalog_updated_at();

ALTER TABLE plant_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read catalog" ON plant_catalog
  FOR SELECT TO authenticated USING (true);

ALTER TABLE garden_placements
  ADD COLUMN plant_catalog_id UUID REFERENCES plant_catalog(id) ON DELETE SET NULL;

CREATE INDEX idx_garden_placements_catalog_id ON garden_placements(plant_catalog_id);

-- Starter catalog (upsert by common name for idempotent re-runs)
INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, companion_plants, benefits)
VALUES
  ('Tomato', 'Solanum lycopersicum', 'Full sun (6–8+ hours)', 'Regular; keep soil evenly moist', '["Basil", "Marigold", "Carrot"]'::jsonb, '["High in lycopene", "Heavy feeder"]'::jsonb),
  ('Basil', 'Ocimum basilicum', 'Full sun', 'Moderate; avoid wet leaves', '["Tomato", "Pepper"]'::jsonb, '["Repels aphids", "Culinary herb"]'::jsonb),
  ('Bell Pepper', 'Capsicum annuum', 'Full sun', 'Regular; consistent moisture', '["Basil", "Tomato", "Carrot"]'::jsonb, '["Rich in vitamin C"]'::jsonb),
  ('Lettuce', 'Lactuca sativa', 'Partial sun to full sun', 'Regular; shallow roots', '["Carrot", "Radish", "Strawberry"]'::jsonb, '["Fast-growing", "Cool-season crop"]'::jsonb),
  ('Carrot', 'Daucus carota', 'Full sun', 'Regular; deep infrequent watering', '["Tomato", "Lettuce", "Onion"]'::jsonb, '["Root crop", "Loose soil preferred"]'::jsonb),
  ('Cucumber', 'Cucumis sativus', 'Full sun', 'High; consistent moisture', '["Beans", "Peas", "Radish"]'::jsonb, '["Vining; needs support"]'::jsonb),
  ('Zucchini', 'Cucurbita pepo', 'Full sun', 'Regular to high', '["Beans", "Peas", "Nasturtium"]'::jsonb, '["Prolific producer"]'::jsonb),
  ('Strawberry', 'Fragaria × ananassa', 'Full sun', 'Regular; avoid drought', '["Lettuce", "Spinach", "Thyme"]'::jsonb, '["Perennial", "Ground cover option"]'::jsonb),
  ('Blueberry', 'Vaccinium corymbosum', 'Full sun', 'Regular; acidic soil', '["Strawberry"]'::jsonb, '["Acid-loving shrub", "Perennial"]'::jsonb),
  ('Kale', 'Brassica oleracea', 'Full sun to partial shade', 'Regular', '["Beet", "Celery", "Herbs"]'::jsonb, '["Cold tolerant", "Nutrient dense"]'::jsonb),
  ('Spinach', 'Spinacia oleracea', 'Partial shade to full sun', 'Regular', '["Strawberry", "Peas"]'::jsonb, '["Cool-season", "Fast harvest"]'::jsonb),
  ('Green Bean', 'Phaseolus vulgaris', 'Full sun', 'Moderate', '["Corn", "Cucumber", "Strawberry"]'::jsonb, '["Nitrogen fixer", "Bush or pole varieties"]'::jsonb),
  ('Pea', 'Pisum sativum', 'Full sun', 'Moderate', '["Carrot", "Cucumber", "Radish"]'::jsonb, '["Cool-season", "Climbing support"]'::jsonb),
  ('Rosemary', 'Salvia rosmarina', 'Full sun', 'Low once established', '["Sage", "Carrot", "Beans"]'::jsonb, '["Drought tolerant perennial", "Culinary"]'::jsonb),
  ('Mint', 'Mentha', 'Partial sun to full sun', 'High; moist soil', '["Cabbage", "Tomato"]'::jsonb, '["Spreads aggressively; contain in pot"]'::jsonb),
  ('Marigold', 'Tagetes', 'Full sun', 'Moderate', '["Tomato", "Pepper", "Cucumber"]'::jsonb, '["Pest deterrent", "Companion flower"]'::jsonb),
  ('Lavender', 'Lavandula', 'Full sun', 'Low; well-drained soil', '["Rosemary", "Sage"]'::jsonb, '["Pollinator friendly", "Drought tolerant"]'::jsonb),
  ('Sunflower', 'Helianthus annuus', 'Full sun', 'Moderate to regular', '["Cucumber", "Corn"]'::jsonb, '["Attracts pollinators", "Tall variety needs space"]'::jsonb)
ON CONFLICT ((lower(common_name))) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  light_requirements = EXCLUDED.light_requirements,
  water_needs = EXCLUDED.water_needs,
  companion_plants = EXCLUDED.companion_plants,
  benefits = EXCLUDED.benefits,
  updated_at = now();
