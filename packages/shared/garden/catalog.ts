import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlantCatalogEntry, PlantCatalogVariety } from '../types/garden';

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === 'string');
}

function mapCatalogRow(row: Record<string, unknown>): PlantCatalogEntry {
  return {
    id: row.id as string,
    common_name: row.common_name as string,
    scientific_name: (row.scientific_name as string | null) ?? null,
    light_requirements: (row.light_requirements as string | null) ?? null,
    water_needs: (row.water_needs as string | null) ?? null,
    climate_preferences: (row.climate_preferences as Record<string, unknown> | null) ?? null,
    nutritional_needs: (row.nutritional_needs as Record<string, unknown> | null) ?? null,
    companion_plants: asStringArray(row.companion_plants),
    benefits: asStringArray(row.benefits),
    medicinal_uses: asStringArray(row.medicinal_uses),
  };
}

export async function listPlantCatalog(
  supabase: SupabaseClient,
  query?: string
): Promise<{ data: PlantCatalogEntry[]; error: string | null }> {
  const { data, error } = await supabase.from('plant_catalog').select('*').order('common_name');

  if (error) {
    return { data: [], error: error.message };
  }

  let entries = (data ?? []).map((row) => mapCatalogRow(row as Record<string, unknown>));

  const trimmed = query?.trim().toLowerCase();
  if (trimmed) {
    entries = entries.filter(
      (entry) =>
        entry.common_name.toLowerCase().includes(trimmed) ||
        entry.scientific_name?.toLowerCase().includes(trimmed)
    );
  }

  return { data: entries, error: null };
}

export async function getPlantCatalogEntry(
  supabase: SupabaseClient,
  catalogId: string
): Promise<{ data: PlantCatalogEntry | null; error: string | null }> {
  const { data, error } = await supabase
    .from('plant_catalog')
    .select('*')
    .eq('id', catalogId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: mapCatalogRow(data as Record<string, unknown>), error: null };
}

function mapVarietyRow(row: Record<string, unknown>): PlantCatalogVariety {
  return {
    id: row.id as string,
    plant_catalog_id: row.plant_catalog_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    sort_order: (row.sort_order as number) ?? 0,
  };
}

export async function listPlantCatalogVarieties(
  supabase: SupabaseClient
): Promise<{ data: PlantCatalogVariety[]; error: string | null }> {
  const { data, error } = await supabase
    .from('plant_catalog_variety')
    .select('*')
    .order('sort_order')
    .order('name');

  if (error) {
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) => mapVarietyRow(row as Record<string, unknown>)),
    error: null,
  };
}
