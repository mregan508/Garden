/** Pure satellite imagery — property boundaries are drawn as a GeoJSON overlay. */
export const MAPBOX_SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-v9';

/** @deprecated Use MAPBOX_SATELLITE_STYLE; lot lines are rendered as an overlay. */
export const MAPBOX_SATELLITE_STREETS_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const DEFAULT_SHOW_PROPERTY_LINES = true;

export const PROPERTY_LINES_STORAGE_KEY = 'garden_show_property_lines';

/** Garden map always uses satellite; property lines are toggled via overlay layers. */
export function mapStyleForPropertyLines(_showPropertyLines: boolean): string {
  return MAPBOX_SATELLITE_STYLE;
}

export function readStoredPropertyLinesPreference(
  stored: string | null | undefined
): boolean {
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return DEFAULT_SHOW_PROPERTY_LINES;
}
