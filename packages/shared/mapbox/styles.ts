/** Pure satellite imagery — no street or lot overlay. */
export const MAPBOX_SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-v9';

/** Satellite with roads, labels, and building footprints (lot context at garden zoom). */
export const MAPBOX_SATELLITE_STREETS_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const DEFAULT_SHOW_PROPERTY_LINES = true;

export const PROPERTY_LINES_STORAGE_KEY = 'garden_show_property_lines';

export function mapStyleForPropertyLines(showPropertyLines: boolean): string {
  return showPropertyLines ? MAPBOX_SATELLITE_STREETS_STYLE : MAPBOX_SATELLITE_STYLE;
}

export function readStoredPropertyLinesPreference(
  stored: string | null | undefined
): boolean {
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return DEFAULT_SHOW_PROPERTY_LINES;
}
