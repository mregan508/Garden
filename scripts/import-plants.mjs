#!/usr/bin/env node
/**
 * Upsert plants from packages/shared/data/plants/plants.json into plant_catalog.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
 *
 * Usage (from repo root):
 *   node scripts/import-plants.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const plantsPath = join(__dirname, '../packages/shared/data/plants/plants.json');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const plants = JSON.parse(readFileSync(plantsPath, 'utf8'));

for (const plant of plants) {
  const { data: existing, error: lookupError } = await supabase
    .from('plant_catalog')
    .select('id')
    .ilike('common_name', plant.common_name)
    .maybeSingle();

  if (lookupError) {
    console.error(`Lookup failed for ${plant.common_name}:`, lookupError.message);
    process.exit(1);
  }

  const row = {
    common_name: plant.common_name,
    scientific_name: plant.scientific_name ?? null,
    light_requirements: plant.light_requirements ?? null,
    water_needs: plant.water_needs ?? null,
    climate_preferences: plant.climate_preferences ?? null,
    nutritional_needs: plant.nutritional_needs ?? null,
    companion_plants: plant.companion_plants ?? null,
    benefits: plant.benefits ?? null,
    medicinal_uses: plant.medicinal_uses ?? null,
  };

  if (existing) {
    const { error } = await supabase.from('plant_catalog').update(row).eq('id', existing.id);
    if (error) {
      console.error(`Update failed for ${plant.common_name}:`, error.message);
      process.exit(1);
    }
    console.log(`Updated ${plant.common_name}`);
  } else {
    const { error } = await supabase.from('plant_catalog').insert(row);
    if (error) {
      console.error(`Insert failed for ${plant.common_name}:`, error.message);
      process.exit(1);
    }
    console.log(`Inserted ${plant.common_name}`);
  }
}

console.log(`Done. Processed ${plants.length} plants.`);
