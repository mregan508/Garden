-- Garden placements: user plant pins on the aerial map (Phase 1)

CREATE TABLE garden_placements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  latitude    DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude   DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_garden_placements_user_id ON garden_placements(user_id);

COMMENT ON TABLE garden_placements IS 'User-placed plant pins on the garden map';

CREATE OR REPLACE FUNCTION update_garden_placements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER garden_placements_updated_at
  BEFORE UPDATE ON garden_placements
  FOR EACH ROW
  EXECUTE FUNCTION update_garden_placements_updated_at();

ALTER TABLE garden_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own placements" ON garden_placements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own placements" ON garden_placements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own placements" ON garden_placements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own placements" ON garden_placements
  FOR DELETE USING (auth.uid() = user_id);
