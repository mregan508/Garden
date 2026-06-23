import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, '../supabase/migrations/20250623260000_expand_catalog_northeast_100.sql'),
  'utf8'
).replace(/\r\n/g, '\n');

const suffix = `
ON CONFLICT ((lower(common_name))) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  light_requirements = EXCLUDED.light_requirements,
  water_needs = EXCLUDED.water_needs,
  climate_preferences = EXCLUDED.climate_preferences,
  companion_plants = EXCLUDED.companion_plants,
  benefits = EXCLUDED.benefits,
  updated_at = now();`;

const valuesStart = sql.indexOf('VALUES\n') + 'VALUES\n'.length;
const valuesEnd = sql.indexOf('ON CONFLICT');
const valuesBlock = sql.slice(valuesStart, valuesEnd).trimEnd();

const tupleRegex = /  \(\n[\s\S]*?\n  \)/g;
const tuples = valuesBlock.match(tupleRegex);
if (!tuples || tuples.length !== 50) {
  console.error(`Expected 50 tuples, got ${tuples?.length ?? 0}`);
  process.exit(1);
}

const header = `INSERT INTO plant_catalog (common_name, scientific_name, light_requirements, water_needs, climate_preferences, companion_plants, benefits)
VALUES
`;

const chunkSize = 17;
for (let i = 0; i < tuples.length; i += chunkSize) {
  const chunk = tuples.slice(i, i + chunkSize);
  const batchSql = header + chunk.join(',\n') + suffix;
  const batchNum = Math.floor(i / chunkSize) + 1;
  writeFileSync(join(__dirname, `_batch${batchNum}.sql`), batchSql);
  console.log(`batch${batchNum}: ${chunk.length} plants, ${batchSql.length} bytes`);
}
