-- Indoor plant flag: exempt from outdoor weather care (rain auto-water, frost alerts)

ALTER TABLE garden_placements
  ADD COLUMN is_indoor BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN garden_placements.is_indoor IS 'Indoor plants are exempt from rain/cold outdoor weather care features';
