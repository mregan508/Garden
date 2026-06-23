-- Recurring care reminders per plant placement

CREATE TABLE garden_reminders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placement_id   UUID NOT NULL REFERENCES garden_placements(id) ON DELETE CASCADE,
  reminder_type  TEXT NOT NULL CHECK (reminder_type IN (
    'watered',
    'fertilized',
    'fungicide',
    'insecticide',
    'pruning'
  )),
  interval_days  INTEGER NOT NULL CHECK (interval_days > 0 AND interval_days <= 365),
  next_due_at    TIMESTAMPTZ NOT NULL,
  enabled        BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (placement_id, reminder_type)
);

CREATE INDEX idx_garden_reminders_user_id ON garden_reminders(user_id);
CREATE INDEX idx_garden_reminders_next_due ON garden_reminders(next_due_at) WHERE enabled = true;

COMMENT ON TABLE garden_reminders IS 'Recurring care reminders linked to plant placements';

CREATE OR REPLACE FUNCTION update_garden_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER garden_reminders_updated_at
  BEFORE UPDATE ON garden_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_garden_reminders_updated_at();

ALTER TABLE garden_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own reminders" ON garden_reminders
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own reminders" ON garden_reminders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own reminders" ON garden_reminders
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete own reminders" ON garden_reminders
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM garden_placements gp
      WHERE gp.id = placement_id AND gp.user_id = auth.uid()
    )
  );
