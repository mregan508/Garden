-- Plant care journal entries linked to map placements

CREATE TABLE garden_journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placement_id  UUID NOT NULL REFERENCES garden_placements(id) ON DELETE CASCADE,
  entry_type    TEXT NOT NULL CHECK (entry_type IN (
    'planted',
    'watered',
    'fertilized',
    'fungicide',
    'insecticide',
    'budding',
    'fruiting',
    'harvest',
    'pruning',
    'transplant',
    'note'
  )),
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_garden_journal_placement_id ON garden_journal_entries(placement_id);
CREATE INDEX idx_garden_journal_user_id ON garden_journal_entries(user_id);
CREATE INDEX idx_garden_journal_occurred_at ON garden_journal_entries(occurred_at DESC);

COMMENT ON TABLE garden_journal_entries IS 'Care and growth log for each plant placement';

CREATE OR REPLACE FUNCTION update_garden_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER garden_journal_updated_at
  BEFORE UPDATE ON garden_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_garden_journal_updated_at();

ALTER TABLE garden_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own journal entries" ON garden_journal_entries
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own journal entries" ON garden_journal_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own journal entries" ON garden_journal_entries
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete own journal entries" ON garden_journal_entries
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );
