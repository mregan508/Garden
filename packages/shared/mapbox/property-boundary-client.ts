import type { PropertyBoundaryResponse } from './property-boundary';

export const DEFAULT_GARDEN_WEB_URL = 'https://mregan.xyz/garden';

export function propertyBoundaryApiUrl(
  apiBase: string,
  latitude: number,
  longitude: number
): string {
  const base = apiBase.replace(/\/$/, '');
  const params = new URLSearchParams({
    lat: latitude.toFixed(6),
    lng: longitude.toFixed(6),
  });
  return `${base}/api/property-boundary?${params.toString()}`;
}

export function resolveGardenWebBaseUrl(options?: {
  windowOrigin?: string;
  basePath?: string;
  expoGardenWebUrl?: string | null;
}): string {
  if (options?.windowOrigin && options.basePath !== undefined) {
    return `${options.windowOrigin}${options.basePath}`;
  }
  if (options?.expoGardenWebUrl?.trim()) {
    return options.expoGardenWebUrl.trim().replace(/\/$/, '');
  }
  return DEFAULT_GARDEN_WEB_URL;
}

export async function fetchPropertyBoundaryFromApi(
  apiBase: string,
  latitude: number,
  longitude: number
): Promise<PropertyBoundaryResponse> {
  const response = await fetch(propertyBoundaryApiUrl(apiBase, latitude, longitude));
  if (!response.ok) {
    return {
      feature: null,
      source: 'none',
      message: 'Could not load property boundary.',
    };
  }
  return (await response.json()) as PropertyBoundaryResponse;
}
