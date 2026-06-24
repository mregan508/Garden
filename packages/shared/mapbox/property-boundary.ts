type Position = [number, number];
type Ring = Position[];

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Ring[];
}

interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: Ring[][];
}

type BoundaryGeometry = PolygonGeometry | MultiPolygonGeometry;

interface BoundaryFeature {
  type: 'Feature';
  geometry: BoundaryGeometry;
  properties: Record<string, unknown> | null;
}

export type PropertyBoundarySource = 'regrid' | 'openstreetmap-lot' | 'openstreetmap-building' | 'none';

export interface PropertyBoundaryResponse {
  feature: BoundaryFeature | null;
  source: PropertyBoundarySource;
  message: string | null;
}

const OVERPASS_USER_AGENT = 'GardenApp/1.0 (https://mregan.xyz/garden)';
const MAX_LOT_AREA = 0.00008;

function isPolygonGeometry(geometry: unknown): geometry is BoundaryGeometry {
  if (!geometry || typeof geometry !== 'object') return false;
  const type = (geometry as { type?: string }).type;
  return type === 'Polygon' || type === 'MultiPolygon';
}

function ringsFromGeometry(geometry: BoundaryGeometry): Ring[] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates;
  }
  return geometry.coordinates.flatMap((polygon: Ring[]) => polygon);
}

function ringArea(ring: Ring): number {
  if (ring.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function geometryArea(geometry: BoundaryGeometry): number {
  return ringsFromGeometry(geometry).reduce((sum, ring) => sum + ringArea(ring), 0);
}

function pointInRing(point: Position, ring: Ring): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInGeometry(lat: number, lng: number, geometry: BoundaryGeometry): boolean {
  const point: Position = [lng, lat];
  const rings = ringsFromGeometry(geometry);
  if (rings.length === 0) return false;
  if (!pointInRing(point, rings[0])) return false;
  for (let i = 1; i < rings.length; i += 1) {
    if (pointInRing(point, rings[i])) return false;
  }
  return true;
}

function pickSmallestContainingPolygon(
  lat: number,
  lng: number,
  features: BoundaryFeature[],
  maxArea?: number
): BoundaryFeature | null {
  const candidates = features.filter((feature) => {
    if (!isPolygonGeometry(feature.geometry) || !pointInGeometry(lat, lng, feature.geometry)) {
      return false;
    }
    if (maxArea !== undefined && geometryArea(feature.geometry) > maxArea) {
      return false;
    }
    return true;
  });
  if (candidates.length === 0) {
    return null;
  }
  candidates.sort((a, b) => geometryArea(a.geometry) - geometryArea(b.geometry));
  return candidates[0];
}

function ringCentroid(ring: Ring): Position {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (const [x, y] of ring) {
    sumX += x;
    sumY += y;
    count += 1;
  }
  if (count === 0) {
    return [0, 0];
  }
  return [sumX / count, sumY / count];
}

function centroidDistanceSquared(lat: number, lng: number, geometry: BoundaryGeometry): number {
  const ring = ringsFromGeometry(geometry)[0];
  if (!ring) return Number.POSITIVE_INFINITY;
  const [cx, cy] = ringCentroid(ring);
  const dx = cx - lng;
  const dy = cy - lat;
  return dx * dx + dy * dy;
}

function pickBoundaryPolygon(
  lat: number,
  lng: number,
  features: BoundaryFeature[],
  options?: { maxArea?: number; maxCentroidDistanceSquared?: number }
): BoundaryFeature | null {
  const containing = pickSmallestContainingPolygon(lat, lng, features, options?.maxArea);
  if (containing) {
    return containing;
  }

  const maxDistance = options?.maxCentroidDistanceSquared ?? 0.00000025;
  let best: BoundaryFeature | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const feature of features) {
    if (!isPolygonGeometry(feature.geometry)) continue;
    if (options?.maxArea !== undefined && geometryArea(feature.geometry) > options.maxArea) {
      continue;
    }
    const distance = centroidDistanceSquared(lat, lng, feature.geometry);
    if (distance > maxDistance || distance >= bestDistance) {
      continue;
    }
    bestDistance = distance;
    best = feature;
  }

  return best;
}

async function fetchRegridParcel(
  lat: number,
  lng: number,
  token: string
): Promise<BoundaryFeature | null> {
  const url = new URL('https://app.regrid.com/api/v2/parcels/point');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('token', token);

  const response = await fetch(url.toString());
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { features?: BoundaryFeature[] };
  const feature = data.features?.[0];
  if (!feature || !isPolygonGeometry(feature.geometry)) {
    return null;
  }
  return feature;
}

interface OverpassElement {
  type: 'way' | 'relation';
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
}

function overpassWayToFeature(
  element: OverpassElement,
  kind: 'lot' | 'building'
): BoundaryFeature | null {
  const geometry = element.geometry;
  if (!geometry || geometry.length < 4) {
    return null;
  }
  const ring: Ring = geometry.map((node) => [node.lon, node.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }
  return {
    type: 'Feature',
    properties: { source: 'openstreetmap', kind, ...element.tags },
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  };
}

async function fetchOpenStreetMapBoundary(
  lat: number,
  lng: number
): Promise<{ lot: BoundaryFeature | null; building: BoundaryFeature | null }> {
  const query = `
    [out:json][timeout:20];
    (
      way(around:75,${lat},${lng})["boundary"="lot"];
      way(around:75,${lat},${lng})["landuse"="residential"];
      way(around:75,${lat},${lng})["landuse"="allotments"];
      way(around:75,${lat},${lng})["leisure"="garden"];
      way(around:75,${lat},${lng})["building"];
    );
    out geom;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': OVERPASS_USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!response.ok) {
    return { lot: null, building: null };
  }

  const data = (await response.json()) as { elements?: OverpassElement[] };
  const lotFeatures: BoundaryFeature[] = [];
  const buildingFeatures: BoundaryFeature[] = [];

  for (const element of data.elements ?? []) {
    if (element.type !== 'way') continue;
    const tags = element.tags ?? {};
    if (tags.building) {
      const feature = overpassWayToFeature(element, 'building');
      if (feature) buildingFeatures.push(feature);
      continue;
    }
    const feature = overpassWayToFeature(element, 'lot');
    if (feature) lotFeatures.push(feature);
  }

  return {
    lot: pickBoundaryPolygon(lat, lng, lotFeatures, {
      maxArea: MAX_LOT_AREA,
      maxCentroidDistanceSquared: 0.00001,
    }),
    building: pickBoundaryPolygon(lat, lng, buildingFeatures, {
      maxCentroidDistanceSquared: 0.000003,
    }),
  };
}

export async function resolvePropertyBoundary(options: {
  latitude: number;
  longitude: number;
  mapboxToken?: string | null;
  regridToken?: string | null;
}): Promise<PropertyBoundaryResponse> {
  const { latitude, longitude, regridToken } = options;

  if (regridToken) {
    const regridFeature = await fetchRegridParcel(latitude, longitude, regridToken);
    if (regridFeature) {
      return {
        feature: regridFeature,
        source: 'regrid',
        message: null,
      };
    }
  }

  const { lot, building } = await fetchOpenStreetMapBoundary(latitude, longitude);

  if (lot) {
    return {
      feature: lot,
      source: 'openstreetmap-lot',
      message:
        'Showing OpenStreetMap lot outline. Add REGRID_API_TOKEN for official assessor parcel lines.',
    };
  }

  if (building) {
    return {
      feature: building,
      source: 'openstreetmap-building',
      message:
        'Showing nearest building outline as lot context. Add REGRID_API_TOKEN for official parcel lines.',
    };
  }

  return {
    feature: null,
    source: 'none',
    message:
      'No property boundary found at this location. Search your home address, zoom in, or add REGRID_API_TOKEN for parcel data.',
  };
}
