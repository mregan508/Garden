import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createPlacementSchema,
  updatePlacementSchema,
  type CreatePlacementInput,
  type GardenPlacement,
  type UpdatePlacementInput,
} from '../types/garden';

export async function listPlacements(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: GardenPlacement[]; error: string | null }> {
  const { data, error } = await supabase
    .from('garden_placements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as GardenPlacement[], error: null };
}

export async function getPlacement(
  supabase: SupabaseClient,
  placementId: string
): Promise<{ data: GardenPlacement | null; error: string | null }> {
  const { data, error } = await supabase
    .from('garden_placements')
    .select('*')
    .eq('id', placementId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: 'Plant not found' };
  }

  return { data: data as GardenPlacement, error: null };
}

export async function createPlacement(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePlacementInput
): Promise<{ data: GardenPlacement | null; error: string | null }> {
  const parsed = createPlacementSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('garden_placements')
    .insert({
      user_id: userId,
      name: parsed.data.name,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      plant_catalog_id: parsed.data.plant_catalog_id ?? null,
      plant_catalog_variety_id: parsed.data.plant_catalog_variety_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as GardenPlacement, error: null };
}

export async function updatePlacement(
  supabase: SupabaseClient,
  placementId: string,
  input: UpdatePlacementInput
): Promise<{ data: GardenPlacement | null; error: string | null }> {
  const parsed = updatePlacementSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { data: null, error: 'No fields to update' };
  }

  const { data, error } = await supabase
    .from('garden_placements')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', placementId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as GardenPlacement, error: null };
}

export async function deletePlacement(
  supabase: SupabaseClient,
  placementId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('garden_placements').delete().eq('id', placementId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
