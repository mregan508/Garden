import type { PlantCatalogEntry, PlantCatalogVariety } from '../types/garden';

/** Strip trailing " Tree" / " Vine" for display with a variety name. */
export function catalogSpeciesLabel(commonName: string): string {
  return commonName.replace(/ (Tree|Vine)$/, '');
}

/** e.g. Honeycrisp + Apple Tree → "Honeycrisp Apple" */
export function buildVarietyDisplayName(
  catalogEntry: PlantCatalogEntry,
  variety: PlantCatalogVariety
): string {
  const species = catalogSpeciesLabel(catalogEntry.common_name);
  return `${variety.name} ${species}`;
}

export function getVarietiesForCatalog(
  varieties: PlantCatalogVariety[],
  catalogId: string | null | undefined
): PlantCatalogVariety[] {
  if (!catalogId) return [];
  return varieties
    .filter((v) => v.plant_catalog_id === catalogId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export function findCatalogVariety(
  varieties: PlantCatalogVariety[],
  varietyId: string | null | undefined
): PlantCatalogVariety | null {
  if (!varietyId) return null;
  return varieties.find((v) => v.id === varietyId) ?? null;
}
