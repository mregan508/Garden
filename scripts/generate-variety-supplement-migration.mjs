/**
 * Generates SQL from catalog-varieties-supplement.tsv (additive varieties only).
 * Run: node scripts/generate-variety-supplement-migration.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'catalog-varieties-supplement.tsv');
const lines = readFileSync(dataPath, 'utf8').replace(/\r\n/g, '\n').trim().split('\n');

const rows = [];
for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  const [catalog, name, description, sort] = line.split('|').map((s) => s.trim());
  if (!catalog || !name) continue;
  const desc = (description ?? '').replace(/'/g, "''");
  const sortOrder = sort ? Number(sort) : rows.filter((r) => r.catalog === catalog).length + 1;
  rows.push({
    catalog: catalog.replace(/'/g, "''"),
    name: name.replace(/'/g, "''"),
    desc,
    sortOrder,
  });
}

const valueTuples = rows
  .map((r) => `  ('${r.catalog}', '${r.name}', '${r.desc}', ${r.sortOrder})`)
  .join(',\n');

const sql = `-- Popular cultivar expansion for catalog species with incomplete variety lists

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

const outPath = join(
  __dirname,
  '../supabase/migrations/20250623340000_expand_popular_varieties.sql'
);
writeFileSync(outPath, sql);
console.log(
  `Wrote ${rows.length} varieties for ${new Set(rows.map((r) => r.catalog)).size} species to ${outPath}`
);
