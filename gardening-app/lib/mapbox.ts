import Mapbox from '@rnmapbox/maps';

const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

if (token) {
  Mapbox.setAccessToken(token);
}

export function isMapboxConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);
}

export function getMapboxAccessToken(): string {
  return process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
}

export { Mapbox };
