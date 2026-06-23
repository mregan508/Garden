import { z } from 'zod';

/**
 * A plant pin placed on the user's garden map.
 * Phase 2: optional plant_catalog_id links to reference data in plant_catalog.
 */
export interface GardenPlacement {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Nullable FK to plant_catalog — added in Phase 2 migration */
  plant_catalog_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Phase 2 reference plant data (not yet in database).
 * See docs/PHASE2_PLANT_CATALOG.md for the planned schema.
 */
export interface PlantCatalogEntry {
  id: string;
  common_name: string;
  scientific_name: string | null;
  light_requirements: string | null;
  water_needs: string | null;
  climate_preferences: Record<string, unknown> | null;
  nutritional_needs: Record<string, unknown> | null;
  companion_plants: string[] | null;
  benefits: string[] | null;
  medicinal_uses: string[] | null;
}

export const createPlacementSchema = z.object({
  name: z.string().trim().min(1, 'Plant name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  plant_catalog_id: z.string().uuid().nullish(),
});

export const updatePlacementSchema = z.object({
  name: z.string().trim().min(1, 'Plant name is required').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  plant_catalog_id: z.string().uuid().nullish(),
});

export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;

export const JOURNAL_ENTRY_TYPES = [
  'planted',
  'watered',
  'fertilized',
  'fungicide',
  'insecticide',
  'budding',
  'fruiting',
  'harvest',
  'pruning',
  'transplant',
  'note',
] as const;

export type JournalEntryType = (typeof JOURNAL_ENTRY_TYPES)[number];

export const JOURNAL_ENTRY_LABELS: Record<JournalEntryType, string> = {
  planted: 'Planted',
  watered: 'Watered',
  fertilized: 'Fertilized',
  fungicide: 'Fungicide applied',
  insecticide: 'Insecticide applied',
  budding: 'Started budding',
  fruiting: 'Started producing fruit',
  harvest: 'Harvested',
  pruning: 'Pruned',
  transplant: 'Transplanted',
  note: 'Note',
};

export interface GardenJournalEntry {
  id: string;
  user_id: string;
  placement_id: string;
  entry_type: JournalEntryType;
  occurred_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const createJournalEntrySchema = z.object({
  entry_type: z.enum(JOURNAL_ENTRY_TYPES),
  occurred_at: z.string().datetime({ message: 'Invalid date' }),
  notes: z.string().trim().max(2000).nullish(),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
