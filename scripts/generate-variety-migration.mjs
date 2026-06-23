/**
 * Generates SQL to seed plant_catalog_variety for all catalog species.
 * Run: node scripts/generate-variety-migration.mjs > supabase/migrations/20250623280000_varieties_all_catalog.sql
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'catalog-varieties.tsv');
const lines = readFileSync(dataPath, 'utf8').replace(/\r\n/g, '\n').trim().split('\n');

const rows = [];
for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  const [catalog, name, description, sort] = line.split('|').map((s) => s.trim());
  if (!catalog || !name) continue;
  const desc = (description ?? '').replace(/'/g, "''");
  const sortOrder = sort ? Number(sort) : rows.filter((r) => r.catalog === catalog).length + 1;
  rows.push({ catalog, name: name.replace(/'/g, "''"), desc, sortOrder });
}

const valueTuples = rows
  .map(
    (r) =>
      `  ('${r.catalog.replace(/'/g, "''")}', '${r.name}', '${r.desc}', ${r.sortOrder})`
  )
  .join(',\n');

const sql = `-- Cultivar / subspecies options for all plant_catalog species

INSERT INTO plant_catalog_variety (plant_catalog_id, name, description, sort_order)
SELECT c.id, v.name, v.description, v.sort_order
FROM plant_catalog c
JOIN (VALUES
${valueTuples}
) AS v(catalog_name, name, description, sort_order)
  ON lower(c.common_name) = lower(v.catalog_name)
ON CONFLICT (plant_catalog_id, lower(name)) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
`;

const outPath = join(__dirname, '../supabase/migrations/20250623280000_varieties_all_catalog.sql');
writeFileSync(outPath, sql);
console.log(`Wrote ${rows.length} varieties for ${new Set(rows.map((r) => r.catalog)).size} species to ${outPath}`);
