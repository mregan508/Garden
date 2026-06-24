import { resolvePropertyBoundary } from '@gardening/shared';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'));
  const lng = Number(request.nextUrl.searchParams.get('lng'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { feature: null, source: 'none', message: 'lat and lng are required.' },
      { status: 400 }
    );
  }

  const mapboxToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.MAPBOX_ACCESS_TOKEN ?? null;
  const regridToken = process.env.REGRID_API_TOKEN ?? null;

  const result = await resolvePropertyBoundary({
    latitude: lat,
    longitude: lng,
    mapboxToken,
    regridToken,
  });

  return NextResponse.json(result);
}
