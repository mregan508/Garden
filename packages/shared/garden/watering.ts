import type { SupabaseClient } from '@supabase/supabase-js';
import type { GardenPlacement } from '../types/garden';
import type { GardenWeatherForecast } from '../weather/forecast';
import { isSubstantialRain, todayDateKey } from '../weather/forecast';
import { createJournalEntry } from './journal';

export const RAIN_AUTO_WATER_NOTE = 'Auto-watering from substantial rain';

export function isOutdoorPlacement(placement: GardenPlacement): boolean {
  return !placement.is_indoor;
}

export function filterOutdoorPlacements(placements: GardenPlacement[]): GardenPlacement[] {
  return placements.filter(isOutdoorPlacement);
}

export function countPlacementsByLocation(placements: GardenPlacement[]): {
  indoor: number;
  outdoor: number;
} {
  const indoor = placements.filter((p) => p.is_indoor).length;
  return { indoor, outdoor: placements.length - indoor };
}

export async function markPlacementsWatered(
  supabase: SupabaseClient,
  userId: string,
  placements: GardenPlacement[],
  options?: { notes?: string | null; occurredAt?: string }
): Promise<{ wateredCount: number; error: string | null }> {
  if (placements.length === 0) {
    return { wateredCount: 0, error: null };
  }

  const occurredAt = options?.occurredAt ?? new Date().toISOString();
  let wateredCount = 0;

  for (const placement of placements) {
    const { error } = await createJournalEntry(supabase, userId, placement.id, {
      entry_type: 'watered',
      occurred_at: occurredAt,
      notes: options?.notes ?? null,
    });
    if (error) {
      return { wateredCount, error };
    }
    wateredCount += 1;
  }

  return { wateredCount, error: null };
}

export function rainAutoWaterStorageKey(userId: string): string {
  return `garden_rain_auto_water_${userId}`;
}

export async function processRainAutoWatering(
  supabase: SupabaseClient,
  userId: string,
  placements: GardenPlacement[],
  forecast: GardenWeatherForecast,
  lastAutoWaterDate: string | null
): Promise<{ wateredCount: number; dateKey: string | null; error: string | null }> {
  if (!isSubstantialRain(forecast)) {
    return { wateredCount: 0, dateKey: null, error: null };
  }

  const dateKey = todayDateKey();
  if (lastAutoWaterDate === dateKey) {
    return { wateredCount: 0, dateKey: null, error: null };
  }

  const outdoor = filterOutdoorPlacements(placements);
  if (outdoor.length === 0) {
    return { wateredCount: 0, dateKey: null, error: null };
  }

  const { wateredCount, error } = await markPlacementsWatered(supabase, userId, outdoor, {
    notes: RAIN_AUTO_WATER_NOTE,
  });

  if (error) {
    return { wateredCount: 0, dateKey: null, error };
  }

  return { wateredCount, dateKey, error: null };
}
