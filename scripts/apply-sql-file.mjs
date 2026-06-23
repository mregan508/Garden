#!/usr/bin/env node
/**
 * Apply a SQL migration file via Supabase Management API using service role.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/apply-sql-file.mjs path/to/file.sql
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/apply-sql-file.mjs <path-to.sql>');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sql = readFileSync(filePath, 'utf8');

const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
  method: 'POST',
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});

// Fallback: run statements via pg meta if available
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: 'public' },
});

// Use the SQL editor endpoint through postgres REST - not available on client.
// Parse INSERT rows and upsert individually instead.
const rowPattern =
  /\(\s*'([^']+(?:''[^']*)*)',\s*'([^']+(?:''[^']*)*)',\s*'([^']+(?:''[^']*)*)',\s*'([^']+(?:''[^']*)*)',\s*'(\{[^']+\})'::jsonb,\s*'(\[[^\]]*\])'::jsonb,\s*'(\[[^\]]*\])'::jsonb\s*\)/gs;

const rows = [...sql.matchAll(rowPattern)];
if (rows.length === 0) {
  console.error('No plant rows parsed from SQL file');
  process.exit(1);
}

for (const match of rows) {
  const [, common_name, scientific_name, light_requirements, water_needs, climateJson, companionsJson, benefitsJson] =
    match;
  const row = {
    common_name: common_name.replace(/''/g, "'"),
    scientific_name: scientific_name.replace(/''/g, "'"),
    light_requirements: light_requirements.replace(/''/g, "'"),
    water_needs: water_needs.replace(/''/g, "'"),
    climate_preferences: JSON.parse(climateJson.replace(/''/g, "'")),
    companion_plants: JSON.parse(companionsJson),
    benefits: JSON.parse(benefitsJson),
  };

  const { data: existing } = await supabase
    .from('plant_catalog')
    .select('id')
    .ilike('common_name', row.common_name)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('plant_catalog').update(row).eq('id', existing.id);
    if (error) {
      console.error(`Update failed for ${row.common_name}:`, error.message);
      process.exit(1);
    }
    console.log(`Updated ${row.common_name}`);
  } else {
    const { error } = await supabase.from('plant_catalog').insert(row);
    if (error) {
      console.error(`Insert failed for ${row.common_name}:`, error.message);
      process.exit(1);
    }
    console.log(`Inserted ${row.common_name}`);
  }
}

const { count } = await supabase.from('plant_catalog').select('*', { count: 'exact', head: true });
console.log(`Done. Catalog total: ${count}`);
