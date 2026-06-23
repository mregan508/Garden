'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Map, { Marker, type MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  buildVarietyDisplayName,
  createJournalEntry,
  createPlacement,
  DEFAULT_PLANT_MAP_FILTERS,
  deletePlacement,
  filterPlacements,
  findCatalogVariety,
  gardenCenter,
  listPlantCatalog,
  listPlantCatalogVarieties,
  listPlacements,
  listReminders,
  updatePlacement,
  useAuth,
  type GardenPlacement,
  type GardenReminder,
  type PlantCatalogEntry,
  type PlantCatalogVariety,
  type PlantMapFilters,
} from '@gardening/shared';
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
    void loadPlacements();
    void loadCatalog();
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
    setSelectedId(null);
    setSelectedCatalogId(null);
    setSelectedVarietyId(null);
    setCatalogSearch('');
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
  };

  const handleUpdateSelected = async () => {
    if (!selectedPlacement || !plantName.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error: updateError } = await updatePlacement(supabase, selectedPlacement.id, {
      name: plantName.trim(),
      plant_catalog_id: selectedCatalogId,
      plant_catalog_variety_id: selectedVarietyId,
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
  };

  const selectPlacement = (placement: GardenPlacement) => {
    setPendingPin(null);
    setSelectedId(placement.id);
    setPlantName(placement.name);
    setSelectedCatalogId(placement.plant_catalog_id ?? null);
    setSelectedVarietyId(placement.plant_catalog_variety_id ?? null);
    setCatalogSearch('');
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
            onClick={() => void signOut()}
            className="mt-2 text-sm text-emerald-600 hover:underline"
          >
            Sign out
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <GardenWeather
              latitude={weatherLocation.latitude}
              longitude={weatherLocation.longitude}
            />
          </div>
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

        {(pendingPin || selectedPlacement) && (
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

        <div className="absolute bottom-4 left-4 z-10">
          <button
            type="button"
            onClick={() => setCompactMarkers((value) => !value)}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-800 shadow-lg ring-1 ring-black/5 hover:bg-emerald-50"
            aria-pressed={compactMarkers}
          >
            {compactMarkers ? 'Show names' : 'Dots only'}
          </button>
        </div>

        <div className="absolute bottom-4 right-4 z-10 hidden max-w-xs md:block">
          <GardenWeather
            latitude={weatherLocation.latitude}
            longitude={weatherLocation.longitude}
            compact
          />
        </div>

        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={mapboxToken}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          style={{ width: '100%', height: '100%' }}
          onClick={handleMapClick}
        >
          {filteredPlacements.map((placement) => (
            <Marker
              key={placement.id}
              latitude={placement.latitude}
              longitude={placement.longitude}
              anchor={compactMarkers ? 'center' : 'bottom'}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                selectPlacement(placement);
              }}
            >
              {compactMarkers ? (
                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow ${
                    selectedId === placement.id ? 'bg-emerald-700' : 'bg-emerald-500'
                  }`}
                  title={placement.name}
                />
              ) : (
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium text-white shadow ${
                    selectedId === placement.id ? 'bg-emerald-700' : 'bg-emerald-500'
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
