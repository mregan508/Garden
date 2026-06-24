'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Map, { Layer, Marker, Source, type MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  buildVarietyDisplayName,
  createJournalEntry,
  createPlacement,
  DEFAULT_PLANT_MAP_FILTERS,
  deletePlacement,
  fetchPropertyBoundaryFromApi,
  filterPlacements,
  findCatalogVariety,
  gardenCenter,
  listPlantCatalog,
  listPlantCatalogVarieties,
  listPlacements,
  listReminders,
  markPlacementsWatered,
  mapStyleForPropertyLines,
  PROPERTY_LINES_STORAGE_KEY,
  rainAutoWaterStorageKey,
  readStoredPropertyLinesPreference,
  resolveGardenWebBaseUrl,
  updatePlacement,
  useAuth,
  type GardenPlacement,
  type GardenReminder,
  type PlantCatalogEntry,
  type PlantCatalogVariety,
  type PlantMapFilters,
  type PropertyBoundaryResponse,
} from '@gardening/shared';
import { basePath } from '@/lib/basePath';
import { searchAddress, type GeocodeResult } from '@/lib/mapboxGeocode';
import { PlantCatalogDetails, PlantCatalogPicker } from '@/components/PlantCatalogPicker';
import { PlantVarietyPicker } from '@/components/PlantVarietyPicker';
import { GardenWeather } from '@/components/GardenWeather';
import { PlantMapFiltersPanel } from '@/components/PlantMapFilters';

const DEFAULT_CENTER = { latitude: 37.7749, longitude: -122.4194 };
const SEARCH_ZOOM = 18;

type PendingPin = { latitude: number; longitude: number };

export default function GardenMap() {
  const { user, supabase, signOut } = useAuth();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

  const [placements, setPlacements] = useState<GardenPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [plantName, setPlantName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: DEFAULT_CENTER.latitude,
    longitude: DEFAULT_CENTER.longitude,
    zoom: 18,
  });
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<GeocodeResult[]>([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showAddressResults, setShowAddressResults] = useState(false);
  const [catalog, setCatalog] = useState<PlantCatalogEntry[]>([]);
  const [catalogVarieties, setCatalogVarieties] = useState<PlantCatalogVariety[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedVarietyId, setSelectedVarietyId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<GardenReminder[]>([]);
  const [mapFilters, setMapFilters] = useState<PlantMapFilters>(DEFAULT_PLANT_MAP_FILTERS);
  const [compactMarkers, setCompactMarkers] = useState(false);
  const [adjustMode, setAdjustMode] = useState(false);
  const [savingPositionId, setSavingPositionId] = useState<string | null>(null);
  const [isIndoor, setIsIndoor] = useState(false);
  const [wateringAll, setWateringAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPropertyLines, setShowPropertyLines] = useState(() => {
    if (typeof window === 'undefined') {
      return readStoredPropertyLinesPreference(null);
    }
    return readStoredPropertyLinesPreference(
      localStorage.getItem(PROPERTY_LINES_STORAGE_KEY)
    );
  });

  useEffect(() => {
    localStorage.setItem(PROPERTY_LINES_STORAGE_KEY, String(showPropertyLines));
  }, [showPropertyLines]);

  const [propertyBoundary, setPropertyBoundary] = useState<
    PropertyBoundaryResponse['feature']
  >(null);
  const [propertyBoundaryMessage, setPropertyBoundaryMessage] = useState<string | null>(
    null
  );

  const gardenApiBase = useMemo(() => {
    if (typeof window === 'undefined') {
      return resolveGardenWebBaseUrl();
    }
    return resolveGardenWebBaseUrl({
      windowOrigin: window.location.origin,
      basePath,
    });
  }, []);

  const boundaryLookupPoint = useMemo(() => {
    return (
      gardenCenter(placements) ?? {
        latitude: viewState.latitude,
        longitude: viewState.longitude,
      }
    );
  }, [placements, viewState.latitude, viewState.longitude]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!showPropertyLines) {
        setPropertyBoundary(null);
        setPropertyBoundaryMessage(null);
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 350));
      if (cancelled) return;

      const result = await fetchPropertyBoundaryFromApi(
        gardenApiBase,
        boundaryLookupPoint.latitude,
        boundaryLookupPoint.longitude
      );
      if (cancelled) return;
      setPropertyBoundary(result.feature);
      setPropertyBoundaryMessage(result.message);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    showPropertyLines,
    gardenApiBase,
    boundaryLookupPoint.latitude,
    boundaryLookupPoint.longitude,
  ]);

  const rainStorageKey = user ? rainAutoWaterStorageKey(user.id) : null;
  const getRainAutoWaterDate = useCallback(() => {
    if (!rainStorageKey || typeof window === 'undefined') return null;
    return localStorage.getItem(rainStorageKey);
  }, [rainStorageKey]);
  const setRainAutoWaterDate = useCallback(
    (date: string) => {
      if (!rainStorageKey || typeof window === 'undefined') return;
      localStorage.setItem(rainStorageKey, date);
    },
    [rainStorageKey]
  );

  const filteredPlacements = useMemo(
    () => filterPlacements(placements, mapFilters, reminders),
    [placements, mapFilters, reminders]
  );

  const weatherLocation = useMemo(() => {
    const center = gardenCenter(placements);
    if (center) return center;
    return { latitude: viewState.latitude, longitude: viewState.longitude };
  }, [placements, viewState.latitude, viewState.longitude]);

  const selectedPlacement = useMemo(
    () => placements.find((p) => p.id === selectedId) ?? null,
    [placements, selectedId]
  );

  const selectedCatalogEntry = useMemo(() => {
    if (!selectedCatalogId) return null;
    return catalog.find((entry) => entry.id === selectedCatalogId) ?? null;
  }, [catalog, selectedCatalogId]);

  const loadCatalog = useCallback(async () => {
    const [catalogResult, varietiesResult] = await Promise.all([
      listPlantCatalog(supabase),
      listPlantCatalogVarieties(supabase),
    ]);
    if (catalogResult.error) {
      setError(catalogResult.error);
    } else {
      setCatalog(catalogResult.data);
    }
    if (varietiesResult.error) {
      setError(varietiesResult.error);
    } else {
      setCatalogVarieties(varietiesResult.data);
    }
  }, [supabase]);

  const loadPlacements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const [placementsResult, remindersResult] = await Promise.all([
      listPlacements(supabase, user.id),
      listReminders(supabase, user.id),
    ]);
    if (placementsResult.error) {
      setError(placementsResult.error);
    } else {
      setPlacements(placementsResult.data);
      if (placementsResult.data.length > 0) {
        setViewState((prev) => ({
          ...prev,
          latitude: placementsResult.data[0].latitude,
          longitude: placementsResult.data[0].longitude,
        }));
      }
    }
    if (remindersResult.error) {
      setError(remindersResult.error);
    } else {
      setReminders(remindersResult.data);
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    void (async () => {
      await loadPlacements();
      await loadCatalog();
    })();
  }, [loadPlacements, loadCatalog]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewState((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {
        // Keep default center when geolocation is denied or unavailable.
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleMapClick = (event: MapMouseEvent) => {
    if (adjustMode) return;
    setSelectedId(null);
    setSelectedCatalogId(null);
    setSelectedVarietyId(null);
    setCatalogSearch('');
    setIsIndoor(false);
    setPendingPin({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
    setPlantName('');
  };

  const selectCatalogEntry = (entry: PlantCatalogEntry) => {
    setSelectedCatalogId(entry.id);
    setSelectedVarietyId(null);
    setPlantName(entry.common_name);
    setCatalogSearch(entry.common_name);
  };

  const selectVariety = (variety: PlantCatalogVariety | null) => {
    if (!variety || !selectedCatalogEntry) {
      setSelectedVarietyId(null);
      if (selectedCatalogEntry) {
        setPlantName(selectedCatalogEntry.common_name);
      }
      return;
    }
    setSelectedVarietyId(variety.id);
    setPlantName(buildVarietyDisplayName(selectedCatalogEntry, variety));
  };

  const clearCatalogSelection = () => {
    setSelectedCatalogId(null);
    setSelectedVarietyId(null);
    setCatalogSearch('');
  };

  const handleSaveNew = async () => {
    if (!user || !pendingPin || !plantName.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error: createError } = await createPlacement(supabase, user.id, {
      name: plantName.trim(),
      latitude: pendingPin.latitude,
      longitude: pendingPin.longitude,
      plant_catalog_id: selectedCatalogId,
      plant_catalog_variety_id: selectedVarietyId,
      is_indoor: isIndoor,
    });
    setSaving(false);
    if (createError) {
      setError(createError);
      return;
    }
    if (data) {
      setPlacements((prev) => [data, ...prev]);
      setSelectedId(data.id);
      await createJournalEntry(supabase, user.id, data.id, {
        entry_type: 'planted',
        occurred_at: new Date().toISOString(),
        notes: null,
      });
    }
    setPendingPin(null);
    setPlantName('');
    setSelectedCatalogId(null);
    setSelectedVarietyId(null);
    setCatalogSearch('');
    setIsIndoor(false);
  };

  const handleUpdateSelected = async () => {
    if (!selectedPlacement || !plantName.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error: updateError } = await updatePlacement(supabase, selectedPlacement.id, {
      name: plantName.trim(),
      plant_catalog_id: selectedCatalogId,
      plant_catalog_variety_id: selectedVarietyId,
      is_indoor: isIndoor,
    });
    setSaving(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    if (data) {
      setPlacements((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedPlacement) return;
    setSaving(true);
    setError(null);
    const { error: deleteError } = await deletePlacement(supabase, selectedPlacement.id);
    setSaving(false);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setPlacements((prev) => prev.filter((p) => p.id !== selectedPlacement.id));
    setSelectedId(null);
    setPlantName('');
    setSelectedCatalogId(null);
    setSelectedVarietyId(null);
    setCatalogSearch('');
    setIsIndoor(false);
  };

  const handleMarkAllWatered = async () => {
    if (!user || placements.length === 0) return;
    setWateringAll(true);
    setError(null);
    setNotice(null);
    const { wateredCount, error: waterError } = await markPlacementsWatered(
      supabase,
      user.id,
      placements
    );
    setWateringAll(false);
    if (waterError) {
      setError(waterError);
      return;
    }
    setNotice(`Marked ${wateredCount} plant${wateredCount === 1 ? '' : 's'} as watered.`);
  };

  const handlePlacementDragEnd = async (
    placementId: string,
    latitude: number,
    longitude: number
  ) => {
    const previous = placements.find((p) => p.id === placementId);
    if (!previous) return;
    if (previous.latitude === latitude && previous.longitude === longitude) return;

    setSavingPositionId(placementId);
    setError(null);
    setPlacements((prev) =>
      prev.map((p) => (p.id === placementId ? { ...p, latitude, longitude } : p))
    );

    const { data, error: updateError } = await updatePlacement(supabase, placementId, {
      latitude,
      longitude,
    });

    setSavingPositionId(null);
    if (updateError) {
      setError(updateError);
      setPlacements((prev) => prev.map((p) => (p.id === placementId ? previous : p)));
      return;
    }
    if (data) {
      setPlacements((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  };

  const toggleAdjustMode = () => {
    setAdjustMode((active) => {
      if (!active) {
        setPendingPin(null);
      }
      return !active;
    });
  };

  const selectPlacement = (placement: GardenPlacement) => {
    setPendingPin(null);
    setSelectedId(placement.id);
    setPlantName(placement.name);
    setSelectedCatalogId(placement.plant_catalog_id ?? null);
    setSelectedVarietyId(placement.plant_catalog_variety_id ?? null);
    setCatalogSearch('');
    setIsIndoor(placement.is_indoor ?? false);
    setViewState((prev) => ({
      ...prev,
      latitude: placement.latitude,
      longitude: placement.longitude,
    }));
  };

  const goToAddress = (result: GeocodeResult) => {
    setViewState((prev) => ({
      ...prev,
      latitude: result.latitude,
      longitude: result.longitude,
      zoom: SEARCH_ZOOM,
    }));
    setAddressQuery(result.placeName);
    setAddressResults([]);
    setShowAddressResults(false);
    setAddressError(null);
    setPendingPin(null);
    setSelectedId(null);
  };

  const handleAddressSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!addressQuery.trim()) return;

    setAddressSearching(true);
    setAddressError(null);
    try {
      const results = await searchAddress(addressQuery, mapboxToken);
      setAddressResults(results);
      setShowAddressResults(true);
      if (results.length === 0) {
        setAddressError('No addresses found. Try a street, city, or zip code.');
      }
    } catch {
      setAddressError('Address search failed. Check your Mapbox token.');
      setAddressResults([]);
    } finally {
      setAddressSearching(false);
    }
  };

  if (!mapboxToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-emerald-50 p-6 text-center">
        <p className="text-emerald-900">
          Set <code className="rounded bg-white px-1">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in
          .env.local to load the map.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <aside className="flex w-full flex-col border-r border-emerald-100 bg-white md:w-80">
        <div className="border-b border-emerald-100 p-4">
          <h1 className="text-lg font-semibold text-emerald-900">My Garden</h1>
          <p className="text-sm text-emerald-700">{user?.email}</p>
          <nav className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link
              href="/activity"
              className="rounded-lg border border-emerald-200 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50"
            >
              Activity
            </Link>
            <Link
              href="/reminders"
              className="rounded-lg border border-emerald-200 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50"
            >
              Reminders
            </Link>
          </nav>
          <button
            type="button"
            onClick={toggleAdjustMode}
            className={`mt-2 rounded-lg border px-2.5 py-1 text-sm ${
              adjustMode
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
            aria-pressed={adjustMode}
          >
            {adjustMode ? 'Done adjusting' : 'Adjust locations'}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 block text-sm text-emerald-600 hover:underline"
          >
            Sign out
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <GardenWeather
              latitude={weatherLocation.latitude}
              longitude={weatherLocation.longitude}
              placements={placements}
              userId={user?.id}
              supabase={supabase}
              getRainAutoWaterDate={getRainAutoWaterDate}
              setRainAutoWaterDate={setRainAutoWaterDate}
              onRainAutoWatered={(count) =>
                setNotice(
                  `Substantial rain detected — marked ${count} outdoor plant${count === 1 ? '' : 's'} as watered.`
                )
              }
            />
          </div>
          {!loading && placements.length > 0 ? (
            <button
              type="button"
              disabled={wateringAll}
              onClick={() => void handleMarkAllWatered()}
              className="mb-4 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-50"
            >
              {wateringAll ? 'Marking watered...' : 'Mark all plants watered'}
            </button>
          ) : null}
          {notice ? (
            <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
              {notice}
            </p>
          ) : null}
          <PlantMapFiltersPanel
            filters={mapFilters}
            onChange={setMapFilters}
            catalog={catalog}
            totalCount={placements.length}
            filteredCount={filteredPlacements.length}
          />
          {loading && <p className="text-sm text-gray-500">Loading plants...</p>}
          {!loading && placements.length === 0 && (
            <p className="text-sm text-gray-500">Click the map to add your first plant.</p>
          )}
          {!loading && placements.length > 0 && filteredPlacements.length === 0 && (
            <p className="text-sm text-gray-500">No plants match these filters.</p>
          )}
          {adjustMode && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Adjustment mode — drag markers on the map to reposition plants.
            </p>
          )}
          <ul className="space-y-2">
            {filteredPlacements.map((placement) => (
              <li key={placement.id} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => selectPlacement(placement)}
                  className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-left text-sm ${
                    selectedId === placement.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-emerald-900">{placement.name}</span>
                  {placement.is_indoor ? (
                    <span className="ml-1 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-800">
                      Indoor
                    </span>
                  ) : null}
                  {placement.plant_catalog_id && (
                    <span className="ml-1 text-xs text-emerald-600">
                      {placement.plant_catalog_variety_id
                        ? findCatalogVariety(catalogVarieties, placement.plant_catalog_variety_id)
                            ?.name ?? 'catalog'
                        : 'catalog'}
                    </span>
                  )}
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {placement.latitude.toFixed(5)}, {placement.longitude.toFixed(5)}
                  </span>
                </button>
                <Link
                  href={`/${placement.id}/journal`}
                  className="flex shrink-0 items-center rounded-lg border border-emerald-200 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Journal
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {(pendingPin || selectedPlacement) && !adjustMode && (
          <div className="border-t border-emerald-100 p-4">
            <h2 className="mb-2 text-sm font-medium text-gray-900">
              {pendingPin ? 'New plant' : 'Edit plant'}
            </h2>
            <PlantCatalogPicker
              catalog={catalog}
              catalogSearch={catalogSearch}
              onCatalogSearchChange={setCatalogSearch}
              selectedCatalogId={selectedCatalogId}
              onSelectCatalogEntry={selectCatalogEntry}
              onClearCatalogSelection={clearCatalogSelection}
            />
            {selectedCatalogEntry && <PlantCatalogDetails entry={selectedCatalogEntry} />}
            <PlantVarietyPicker
              catalogEntry={selectedCatalogEntry}
              varieties={catalogVarieties}
              selectedVarietyId={selectedVarietyId}
              onSelectVariety={selectVariety}
            />
            <label htmlFor="plant-name" className="mb-1 block text-xs font-medium text-gray-700">
              Display name
            </label>
            <input
              id="plant-name"
              type="text"
              value={plantName}
              onChange={(e) => {
                setPlantName(e.target.value);
                if (selectedCatalogId && e.target.value !== selectedCatalogEntry?.common_name) {
                  const expectedWithVariety =
                    selectedCatalogEntry && selectedVarietyId
                      ? buildVarietyDisplayName(
                          selectedCatalogEntry,
                          findCatalogVariety(catalogVarieties, selectedVarietyId)!
                        )
                      : null;
                  if (expectedWithVariety && e.target.value === expectedWithVariety) {
                    return;
                  }
                  setSelectedCatalogId(null);
                  setSelectedVarietyId(null);
                }
              }}
              placeholder="Plant name"
              className="mb-3 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={isIndoor}
                onChange={(e) => setIsIndoor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-600"
              />
              Indoor plant (exempt from rain, cold, and outdoor weather care)
            </label>
            <div className="flex gap-2">
              {pendingPin ? (
                <>
                  <button
                    type="button"
                    disabled={saving || !plantName.trim()}
                    onClick={() => void handleSaveNew()}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingPin(null);
                      setPlantName('');
                      setSelectedCatalogId(null);
                      setSelectedVarietyId(null);
                      setCatalogSearch('');
                      setIsIndoor(false);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={saving || !plantName.trim()}
                    onClick={() => void handleUpdateSelected()}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Update
                  </button>
                  <Link
                    href={`/${selectedPlacement!.id}/journal`}
                    className="rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                  >
                    Journal
                  </Link>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleDeleteSelected()}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {error && <p className="px-4 pb-4 text-sm text-red-600">{error}</p>}
      </aside>

      <div className="relative min-h-[50vh] flex-1">
        <form
          onSubmit={(e) => void handleAddressSearch(e)}
          className="absolute left-3 right-3 top-3 z-10 md:left-4 md:right-auto md:max-w-md"
        >
          <div className="rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => {
                  setAddressQuery(e.target.value);
                  setAddressError(null);
                }}
                onFocus={() => {
                  if (addressResults.length > 0) setShowAddressResults(true);
                }}
                placeholder="Search address or place"
                className="min-w-0 flex-1 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
              <button
                type="submit"
                disabled={addressSearching || !addressQuery.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {addressSearching ? '...' : 'Go'}
              </button>
            </div>
            {addressError && <p className="mt-2 px-1 text-xs text-red-600">{addressError}</p>}
            {showAddressResults && addressResults.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                {addressResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => goToAddress(result)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-emerald-50"
                    >
                      {result.placeName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowPropertyLines((value) => !value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium shadow-lg ring-1 ring-black/5 ${
              showPropertyLines
                ? 'bg-sky-100 text-sky-900 ring-sky-200 hover:bg-sky-200'
                : 'bg-white text-emerald-800 hover:bg-emerald-50'
            }`}
            aria-pressed={showPropertyLines}
          >
            {showPropertyLines ? 'Hide property lines' : 'Show property lines'}
          </button>
          {showPropertyLines && propertyBoundaryMessage ? (
            <p className="max-w-xs rounded-lg bg-white/95 px-3 py-2 text-xs text-sky-900 shadow-lg ring-1 ring-black/5">
              {propertyBoundaryMessage}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setCompactMarkers((value) => !value)}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-800 shadow-lg ring-1 ring-black/5 hover:bg-emerald-50"
            aria-pressed={compactMarkers}
          >
            {compactMarkers ? 'Show names' : 'Dots only'}
          </button>
          <button
            type="button"
            onClick={toggleAdjustMode}
            className={`rounded-lg px-3 py-2 text-sm font-medium shadow-lg ring-1 ring-black/5 ${
              adjustMode
                ? 'bg-amber-100 text-amber-900 ring-amber-200 hover:bg-amber-200'
                : 'bg-white text-emerald-800 hover:bg-emerald-50'
            }`}
            aria-pressed={adjustMode}
          >
            {adjustMode ? 'Done adjusting' : 'Adjust locations'}
          </button>
        </div>

        {adjustMode && (
          <div className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 shadow-lg ring-1 ring-amber-200">
            Drag plants to reposition{savingPositionId ? ' — saving…' : ''}
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10 hidden max-w-xs md:block">
          <GardenWeather
            latitude={weatherLocation.latitude}
            longitude={weatherLocation.longitude}
            placements={placements}
            compact
          />
        </div>

        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={mapboxToken}
          mapStyle={mapStyleForPropertyLines(showPropertyLines)}
          style={{ width: '100%', height: '100%' }}
          onClick={handleMapClick}
        >
          {showPropertyLines && propertyBoundary ? (
            <Source id="property-boundary" type="geojson" data={propertyBoundary}>
              <Layer
                id="property-boundary-fill"
                type="fill"
                paint={{
                  'fill-color': '#facc15',
                  'fill-opacity': 0.12,
                }}
              />
              <Layer
                id="property-boundary-line"
                type="line"
                paint={{
                  'line-color': '#facc15',
                  'line-width': 3,
                  'line-opacity': 0.95,
                }}
              />
            </Source>
          ) : null}
          {filteredPlacements.map((placement) => (
            <Marker
              key={placement.id}
              latitude={placement.latitude}
              longitude={placement.longitude}
              anchor={compactMarkers ? 'center' : 'bottom'}
              draggable={adjustMode}
              onDragEnd={(event) => {
                void handlePlacementDragEnd(
                  placement.id,
                  event.lngLat.lat,
                  event.lngLat.lng
                );
              }}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                selectPlacement(placement);
              }}
            >
              {compactMarkers ? (
                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow ${
                    selectedId === placement.id ? 'bg-emerald-700' : 'bg-emerald-500'
                  } ${adjustMode ? 'cursor-grab ring-2 ring-amber-300 ring-offset-1' : ''} ${
                    savingPositionId === placement.id ? 'opacity-70' : ''
                  }`}
                  title={placement.name}
                />
              ) : (
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium text-white shadow ${
                    selectedId === placement.id ? 'bg-emerald-700' : 'bg-emerald-500'
                  } ${adjustMode ? 'cursor-grab ring-2 ring-amber-300' : ''} ${
                    savingPositionId === placement.id ? 'opacity-70' : ''
                  }`}
                >
                  {placement.name}
                </div>
              )}
            </Marker>
          ))}
          {pendingPin && (
            <Marker latitude={pendingPin.latitude} longitude={pendingPin.longitude} anchor="bottom">
              <div className="h-4 w-4 rounded-full border-2 border-white bg-amber-400 shadow" />
            </Marker>
          )}
        </Map>
      </div>
    </div>
  );
}
