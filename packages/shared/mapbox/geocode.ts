export interface GeocodeResult {
  id: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

export async function searchAddress(
  query: string,
  accessToken: string
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`
  );
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('limit', '5');
  url.searchParams.set('types', 'address,place,locality,neighborhood,postcode,poi');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Address search failed. Check your Mapbox token.');
  }

  const data = (await response.json()) as {
    features: Array<{ id: string; place_name: string; center: [number, number] }>;
  };

  return data.features.map((feature) => ({
    id: feature.id,
    placeName: feature.place_name,
    latitude: feature.center[1],
    longitude: feature.center[0],
  }));
}
