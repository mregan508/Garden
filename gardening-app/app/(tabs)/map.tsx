import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Camera, FillLayer, LineLayer, MapView, PointAnnotation, ShapeSource } from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuth } from '@gardening/shared';
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
  searchAddress,
  updatePlacement,
  type CareFilter,
  type GardenPlacement,
  type GardenReminder,
  type GeocodeResult,
  type PlantCatalogEntry,
  type PlantCatalogVariety,
  type PlantMapFilters,
  type PropertyBoundaryResponse,
} from '@gardening/shared';
import '@/lib/mapbox';
import { getMapboxAccessToken, isMapboxConfigured } from '@/lib/mapbox';
import { GardenWeather } from '@/components/GardenWeather';
import { PlantVarietyPicker } from '@/components/PlantVarietyPicker';

const DEFAULT_CENTER: [number, number] = [-122.4194, 37.7749];
const MAP_ZOOM = 18;

const CARE_OPTIONS: { value: CareFilter; label: string }[] = [
  { value: 'all', label: 'All care status' },
  { value: 'overdue', label: 'Overdue care' },
  { value: 'due_soon', label: 'Due soon (2 days)' },
  { value: 'no_reminders', label: 'No reminders' },
];

type PendingPin = { latitude: number; longitude: number };

export default function MapScreen() {
  const router = useRouter();
  const { user, supabase, signOut } = useAuth();
  const mapboxToken = getMapboxAccessToken();

  const [placements, setPlacements] = useState<GardenPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [cameraAnimation, setCameraAnimation] = useState(0);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plantName, setPlantName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<PlantCatalogEntry[]>([]);
  const [catalogVarieties, setCatalogVarieties] = useState<PlantCatalogVariety[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedVarietyId, setSelectedVarietyId] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<GeocodeResult[]>([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showAddressResults, setShowAddressResults] = useState(false);
  const [showPlantList, setShowPlantList] = useState(false);
  const [reminders, setReminders] = useState<GardenReminder[]>([]);
  const [mapFilters, setMapFilters] = useState<PlantMapFilters>(DEFAULT_PLANT_MAP_FILTERS);
  const [compactMarkers, setCompactMarkers] = useState(false);
  const [adjustMode, setAdjustMode] = useState(false);
  const [savingPositionId, setSavingPositionId] = useState<string | null>(null);
  const [isIndoor, setIsIndoor] = useState(false);
  const [wateringAll, setWateringAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [rainAutoWaterDate, setRainAutoWaterDateState] = useState<string | null>(null);
  const [showPropertyLines, setShowPropertyLines] = useState(
    readStoredPropertyLinesPreference(null)
  );
  const [propertyBoundary, setPropertyBoundary] = useState<
    PropertyBoundaryResponse['feature']
  >(null);
  const [propertyBoundaryMessage, setPropertyBoundaryMessage] = useState<string | null>(
    null
  );

  const gardenApiBase = useMemo(
    () =>
      resolveGardenWebBaseUrl({
        expoGardenWebUrl: process.env.EXPO_PUBLIC_GARDEN_WEB_URL,
      }),
    []
  );

  const getRainAutoWaterDate = useCallback(() => rainAutoWaterDate, [rainAutoWaterDate]);
  const setRainAutoWaterDate = useCallback(
    (date: string) => {
      setRainAutoWaterDateState(date);
      if (user) {
        void AsyncStorage.setItem(rainAutoWaterStorageKey(user.id), date);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;
    void AsyncStorage.getItem(rainAutoWaterStorageKey(user.id)).then((value) => {
      setRainAutoWaterDateState(value);
    });
  }, [user]);

  useEffect(() => {
    void AsyncStorage.getItem(PROPERTY_LINES_STORAGE_KEY).then((value) => {
      setShowPropertyLines(readStoredPropertyLinesPreference(value));
    });
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(PROPERTY_LINES_STORAGE_KEY, String(showPropertyLines));
  }, [showPropertyLines]);

  const boundaryLookupPoint = useMemo(() => {
    const garden = gardenCenter(placements);
    if (garden) return garden;
    return { latitude: center[1], longitude: center[0] };
  }, [placements, center]);

  useEffect(() => {
    if (!showPropertyLines) {
      setPropertyBoundary(null);
      setPropertyBoundaryMessage(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void fetchPropertyBoundaryFromApi(
        gardenApiBase,
        boundaryLookupPoint.latitude,
        boundaryLookupPoint.longitude
      ).then((result) => {
        if (cancelled) return;
        setPropertyBoundary(result.feature);
        setPropertyBoundaryMessage(result.message);
      });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    showPropertyLines,
    gardenApiBase,
    boundaryLookupPoint.latitude,
    boundaryLookupPoint.longitude,
  ]);

  const filteredPlacements = useMemo(
    () => filterPlacements(placements, mapFilters, reminders),
    [placements, mapFilters, reminders]
  );

  const weatherLocation = useMemo(() => {
    const garden = gardenCenter(placements);
    if (garden) return garden;
    return { latitude: center[1], longitude: center[0] };
  }, [placements, center]);

  const selectedPlacement = useMemo(
    () => placements.find((p) => p.id === selectedId) ?? null,
    [placements, selectedId]
  );

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return catalog.slice(0, 8);
    return catalog.filter(
      (entry) =>
        entry.common_name.toLowerCase().includes(q) ||
        entry.scientific_name?.toLowerCase().includes(q)
    );
  }, [catalog, catalogSearch]);

  const selectedCatalogEntry = useMemo(
    () => catalog.find((entry) => entry.id === selectedCatalogId) ?? null,
    [catalog, selectedCatalogId]
  );

  const flyTo = useCallback((longitude: number, latitude: number, animate = true) => {
    setCenter([longitude, latitude]);
    setCameraAnimation(animate ? 800 : 0);
  }, []);

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
        flyTo(placementsResult.data[0].longitude, placementsResult.data[0].latitude, false);
      }
    }
    if (remindersResult.error) {
      setError(remindersResult.error);
    } else {
      setReminders(remindersResult.data);
    }
    setLoading(false);
  }, [supabase, user, flyTo]);

  useEffect(() => {
    void loadPlacements();
    void (async () => {
      const [catalogResult, varietiesResult] = await Promise.all([
        listPlantCatalog(supabase),
        listPlantCatalogVarieties(supabase),
      ]);
      setCatalog(catalogResult.data);
      setCatalogVarieties(varietiesResult.data);
    })();
  }, [loadPlacements, supabase]);

  useEffect(() => {
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      flyTo(location.coords.longitude, location.coords.latitude, false);
    })();
  }, [flyTo]);

  const openNewPinModal = (latitude: number, longitude: number) => {
    setSelectedId(null);
    setSelectedCatalogId(null);
    setSelectedVarietyId(null);
    setCatalogSearch('');
    setIsIndoor(false);
    setPendingPin({ latitude, longitude });
    setPlantName('');
    setModalVisible(true);
    setShowPlantList(false);
  };

  const openEditModal = (placement: GardenPlacement) => {
    if (adjustMode) {
      setSelectedId(placement.id);
      flyTo(placement.longitude, placement.latitude);
      return;
    }
    setPendingPin(null);
    setSelectedId(placement.id);
    setPlantName(placement.name);
    setSelectedCatalogId(placement.plant_catalog_id ?? null);
    setSelectedVarietyId(placement.plant_catalog_variety_id ?? null);
    setCatalogSearch('');
    setIsIndoor(placement.is_indoor ?? false);
    setModalVisible(true);
    setShowPlantList(false);
    flyTo(placement.longitude, placement.latitude);
  };

  const handleMapPress = (event: { geometry?: { coordinates?: number[] } }) => {
    if (adjustMode) return;
    const coords = event.geometry?.coordinates;
    if (!coords || coords.length < 2) return;
    const [longitude, latitude] = coords;
    openNewPinModal(latitude, longitude);
  };

  const closeModal = () => {
    setModalVisible(false);
    setPendingPin(null);
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

  const goToAddress = (result: GeocodeResult) => {
    flyTo(result.longitude, result.latitude);
    setAddressQuery(result.placeName);
    setAddressResults([]);
    setShowAddressResults(false);
    setAddressError(null);
    setPendingPin(null);
    setSelectedId(null);
    setShowPlantList(false);
  };

  const handleAddressSearch = async () => {
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

  const handleSave = async () => {
    if (!user || !plantName.trim()) return;

    setSaving(true);
    setError(null);

    if (pendingPin) {
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
        await createJournalEntry(supabase, user.id, data.id, {
          entry_type: 'planted',
          occurred_at: new Date().toISOString(),
          notes: null,
        });
      }
      closeModal();
      return;
    }

    if (selectedPlacement) {
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
      closeModal();
    }
  };

  const handleDelete = () => {
    if (!selectedPlacement) return;
    Alert.alert('Delete plant', `Remove "${selectedPlacement.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            const { error: deleteError } = await deletePlacement(supabase, selectedPlacement.id);
            setSaving(false);
            if (deleteError) {
              setError(deleteError);
              return;
            }
            setPlacements((prev) => prev.filter((p) => p.id !== selectedPlacement.id));
            closeModal();
          })();
        },
      },
    ]);
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
        setModalVisible(false);
      }
      return !active;
    });
  };

  if (!isMapboxConfigured()) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.missingTokenTitle}>Mapbox token required</Text>
        <Text style={styles.missingTokenText}>
          Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to gardening-app/.env (same pk. token as web).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Garden</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>
        <Pressable onPress={() => void signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.mapWrapper}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : null}

        <KeyboardAvoidingView
          style={styles.addressSearchWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.addressSearchCard}>
            <View style={styles.addressSearchRow}>
              <TextInput
                style={styles.addressInput}
                placeholder="Search address or place"
                placeholderTextColor="#6b7280"
                value={addressQuery}
                onChangeText={(text) => {
                  setAddressQuery(text);
                  setAddressError(null);
                }}
                onFocus={() => {
                  if (addressResults.length > 0) setShowAddressResults(true);
                }}
                returnKeyType="search"
                onSubmitEditing={() => void handleAddressSearch()}
              />
              <Pressable
                style={[
                  styles.addressGoButton,
                  (addressSearching || !addressQuery.trim()) && styles.buttonDisabled,
                ]}
                onPress={() => void handleAddressSearch()}
                disabled={addressSearching || !addressQuery.trim()}
              >
                <Text style={styles.addressGoText}>{addressSearching ? '...' : 'Go'}</Text>
              </Pressable>
            </View>
            {addressError ? <Text style={styles.addressError}>{addressError}</Text> : null}
            {showAddressResults && addressResults.length > 0 ? (
              <View style={styles.addressResults}>
                {addressResults.map((result) => (
                  <Pressable
                    key={result.id}
                    style={styles.addressResultItem}
                    onPress={() => goToAddress(result)}
                  >
                    <Text style={styles.addressResultText}>{result.placeName}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>

        <MapView
          style={styles.map}
          styleURL={mapStyleForPropertyLines(showPropertyLines)}
          onPress={handleMapPress}
        >
          <Camera
            zoomLevel={MAP_ZOOM}
            centerCoordinate={center}
            animationDuration={cameraAnimation}
          />
          {showPropertyLines && propertyBoundary ? (
            <ShapeSource id="property-boundary" shape={propertyBoundary}>
              <FillLayer
                id="property-boundary-fill"
                style={{
                  fillColor: 'rgba(250, 204, 21, 0.12)',
                }}
              />
              <LineLayer
                id="property-boundary-line"
                style={{
                  lineColor: '#facc15',
                  lineWidth: 3,
                  lineOpacity: 0.95,
                }}
              />
            </ShapeSource>
          ) : null}
          {filteredPlacements.map((placement) => (
            <PointAnnotation
              key={placement.id}
              id={placement.id}
              coordinate={[placement.longitude, placement.latitude]}
              draggable={adjustMode}
              onSelected={() => openEditModal(placement)}
              onDragEnd={(feature) => {
                const coords = feature.geometry?.coordinates;
                if (!coords || coords.length < 2) return;
                const [longitude, latitude] = coords;
                void handlePlacementDragEnd(placement.id, latitude, longitude);
              }}
            >
              {compactMarkers ? (
                <View
                  style={[
                    styles.markerDot,
                    selectedId === placement.id ? styles.markerSelected : styles.markerDefault,
                    adjustMode && styles.markerAdjustable,
                    savingPositionId === placement.id && styles.markerSaving,
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.marker,
                    selectedId === placement.id ? styles.markerSelected : styles.markerDefault,
                    adjustMode && styles.markerAdjustable,
                    savingPositionId === placement.id && styles.markerSaving,
                  ]}
                >
                  <Text style={styles.markerText}>{placement.name}</Text>
                </View>
              )}
            </PointAnnotation>
          ))}
          {pendingPin ? (
            <PointAnnotation
              id="pending-pin"
              coordinate={[pendingPin.longitude, pendingPin.latitude]}
            >
              <View style={[styles.marker, styles.markerPending]} />
            </PointAnnotation>
          ) : null}
        </MapView>

        <View style={styles.weatherOverlay}>
          <GardenWeather
            latitude={weatherLocation.latitude}
            longitude={weatherLocation.longitude}
            placements={placements}
            compact
          />
        </View>

        <Pressable
          style={[
            styles.propertyLinesToggle,
            showPropertyLines && styles.propertyLinesToggleActive,
          ]}
          onPress={() => setShowPropertyLines((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ selected: showPropertyLines }}
        >
          <Text
            style={[
              styles.propertyLinesToggleText,
              showPropertyLines && styles.propertyLinesToggleTextActive,
            ]}
          >
            {showPropertyLines ? 'Hide property lines' : 'Show property lines'}
          </Text>
        </Pressable>

        {showPropertyLines && propertyBoundaryMessage ? (
          <View style={styles.propertyLinesMessage} pointerEvents="none">
            <Text style={styles.propertyLinesMessageText}>{propertyBoundaryMessage}</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.compactMarkersToggle}
          onPress={() => setCompactMarkers((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ selected: compactMarkers }}
        >
          <Text style={styles.compactMarkersToggleText}>
            {compactMarkers ? 'Show names' : 'Dots only'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.adjustModeToggle,
            adjustMode && styles.adjustModeToggleActive,
          ]}
          onPress={toggleAdjustMode}
          accessibilityRole="button"
          accessibilityState={{ selected: adjustMode }}
        >
          <Text
            style={[
              styles.adjustModeToggleText,
              adjustMode && styles.adjustModeToggleTextActive,
            ]}
          >
            {adjustMode ? 'Done adjusting' : 'Adjust locations'}
          </Text>
        </Pressable>

        {adjustMode ? (
          <View style={styles.adjustModeBanner} pointerEvents="none">
            <Text style={styles.adjustModeBannerText}>
              Drag plants to reposition{savingPositionId ? ' — saving…' : ''}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={styles.plantListToggle}
          onPress={() => setShowPlantList((open) => !open)}
        >
          <Text style={styles.plantListToggleText}>
            {showPlantList ? 'Hide plants' : `Plants (${placements.length})`}
          </Text>
        </Pressable>

        {showPlantList ? (
          <View style={styles.plantListPanel}>
            <ScrollView keyboardShouldPersistTaps="handled">
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
              {placements.length > 0 ? (
                <Pressable
                  style={[styles.markAllWateredButton, wateringAll && styles.buttonDisabled]}
                  onPress={() => void handleMarkAllWatered()}
                  disabled={wateringAll}
                >
                  <Text style={styles.markAllWateredButtonText}>
                    {wateringAll ? 'Marking watered...' : 'Mark all plants watered'}
                  </Text>
                </Pressable>
              ) : null}
              {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
              <Text style={styles.filterHeading}>
                Filter plants ({filteredPlacements.length} of {placements.length})
              </Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Search by name..."
                placeholderTextColor="#6b7280"
                value={mapFilters.search}
                onChangeText={(text) => setMapFilters((prev) => ({ ...prev, search: text }))}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <Pressable
                  style={[
                    styles.filterChip,
                    mapFilters.catalogCustomOnly && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setMapFilters((prev) => ({
                      ...prev,
                      catalogCustomOnly: !prev.catalogCustomOnly,
                      catalogId: null,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      mapFilters.catalogCustomOnly && styles.filterChipTextActive,
                    ]}
                  >
                    Custom only
                  </Text>
                </Pressable>
                {CARE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.filterChip,
                      mapFilters.care === option.value && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setMapFilters((prev) => ({ ...prev, care: option.value }))
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        mapFilters.care === option.value && styles.filterChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {placements.length === 0 ? (
                <Text style={styles.plantListEmpty}>Tap the map to add your first plant.</Text>
              ) : filteredPlacements.length === 0 ? (
                <Text style={styles.plantListEmpty}>No plants match these filters.</Text>
              ) : (
                filteredPlacements.map((placement) => (
                  <View key={placement.id} style={styles.plantListRow}>
                    <Pressable
                      style={[
                        styles.plantListItem,
                        selectedId === placement.id && styles.plantListItemSelected,
                      ]}
                      onPress={() => openEditModal(placement)}
                    >
                      <Text style={styles.plantListName}>
                        {placement.name}
                        {placement.is_indoor ? (
                          <Text style={styles.plantListIndoor}> · Indoor</Text>
                        ) : null}
                        {placement.plant_catalog_id ? (
                          <Text style={styles.plantListCatalog}> catalog</Text>
                        ) : null}
                      </Text>
                      <Text style={styles.plantListCoords}>
                        {placement.latitude.toFixed(5)}, {placement.longitude.toFixed(5)}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.plantListJournalButton}
                      onPress={() => router.push(`/journal/${placement.id}`)}
                    >
                      <Text style={styles.plantListJournalText}>Journal</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{pendingPin ? 'New plant' : 'Edit plant'}</Text>

              <Text style={styles.fieldLabel}>From catalog (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Search plants..."
                placeholderTextColor="#6b7280"
                value={catalogSearch}
                onChangeText={setCatalogSearch}
              />
              {selectedCatalogId ? (
                <Pressable onPress={clearCatalogSelection}>
                  <Text style={styles.clearCatalogLink}>Use custom name only</Text>
                </Pressable>
              ) : null}
              {filteredCatalog.length > 0 ? (
                <View style={styles.catalogList}>
                  {filteredCatalog.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.catalogItem,
                        selectedCatalogId === item.id && styles.catalogItemSelected,
                      ]}
                      onPress={() => selectCatalogEntry(item)}
                    >
                      <Text style={styles.catalogItemName}>{item.common_name}</Text>
                      {item.scientific_name ? (
                        <Text style={styles.catalogItemScientific}>{item.scientific_name}</Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {selectedCatalogEntry ? (
                <View style={styles.catalogDetails}>
                  {selectedCatalogEntry.light_requirements ? (
                    <Text style={styles.catalogDetailText}>
                      Light: {selectedCatalogEntry.light_requirements}
                    </Text>
                  ) : null}
                  {selectedCatalogEntry.water_needs ? (
                    <Text style={styles.catalogDetailText}>
                      Water: {selectedCatalogEntry.water_needs}
                    </Text>
                  ) : null}
                  {selectedCatalogEntry.companion_plants &&
                  selectedCatalogEntry.companion_plants.length > 0 ? (
                    <Text style={styles.catalogDetailText}>
                      Companions: {selectedCatalogEntry.companion_plants.join(', ')}
                    </Text>
                  ) : null}
                  {selectedCatalogEntry.benefits && selectedCatalogEntry.benefits.length > 0 ? (
                    <Text style={styles.catalogDetailText}>
                      Notes: {selectedCatalogEntry.benefits.join('; ')}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <PlantVarietyPicker
                catalogEntry={selectedCatalogEntry}
                varieties={catalogVarieties}
                selectedVarietyId={selectedVarietyId}
                onSelectVariety={selectVariety}
              />

              <Text style={styles.fieldLabel}>Display name</Text>
              <TextInput
                style={styles.input}
                placeholder="Plant name"
                placeholderTextColor="#6b7280"
                value={plantName}
                onChangeText={(text) => {
                  setPlantName(text);
                  if (selectedCatalogId && text !== selectedCatalogEntry?.common_name) {
                    const variety = findCatalogVariety(catalogVarieties, selectedVarietyId);
                    const expected =
                      selectedCatalogEntry && variety
                        ? buildVarietyDisplayName(selectedCatalogEntry, variety)
                        : null;
                    if (expected && text === expected) return;
                    setSelectedCatalogId(null);
                    setSelectedVarietyId(null);
                  }
                }}
              />

              <Pressable
                style={styles.indoorToggle}
                onPress={() => setIsIndoor((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isIndoor }}
              >
                <View style={[styles.indoorCheckbox, isIndoor && styles.indoorCheckboxChecked]} />
                <Text style={styles.indoorToggleText}>
                  Indoor plant (exempt from rain, cold, and outdoor weather care)
                </Text>
              </Pressable>

              {selectedPlacement && !pendingPin ? (
                <Pressable
                  style={styles.journalButton}
                  onPress={() => {
                    closeModal();
                    router.push(`/journal/${selectedPlacement.id}`);
                  }}
                >
                  <Text style={styles.journalButtonText}>Open journal</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={[styles.saveButton, (saving || !plantName.trim()) && styles.buttonDisabled]}
                onPress={() => void handleSave()}
                disabled={saving || !plantName.trim()}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
              {selectedPlacement ? (
                <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  missingTokenTitle: { fontSize: 18, fontWeight: '600', color: '#064e3b', marginBottom: 8 },
  missingTokenText: { fontSize: 14, color: '#047857', textAlign: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#064e3b' },
  headerSubtitle: { fontSize: 12, color: '#047857' },
  signOut: { color: '#059669', fontSize: 14 },
  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  weatherOverlay: {
    position: 'absolute',
    top: 88,
    right: 12,
    zIndex: 10,
    maxWidth: 220,
  },
  propertyLinesToggle: {
    position: 'absolute',
    top: 88,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  propertyLinesToggleActive: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#7dd3fc',
  },
  propertyLinesToggleText: { color: '#065f46', fontSize: 14, fontWeight: '600' },
  propertyLinesToggleTextActive: { color: '#0c4a6e' },
  propertyLinesMessage: {
    position: 'absolute',
    top: 136,
    left: 12,
    right: 12,
    zIndex: 10,
    maxWidth: 280,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  propertyLinesMessageText: { color: '#0c4a6e', fontSize: 11, lineHeight: 15 },
  compactMarkersToggle: {
    position: 'absolute',
    top: 184,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  compactMarkersToggleText: { color: '#065f46', fontSize: 14, fontWeight: '600' },
  adjustModeToggle: {
    position: 'absolute',
    top: 232,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  adjustModeToggleActive: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  adjustModeToggleText: { color: '#065f46', fontSize: 14, fontWeight: '600' },
  adjustModeToggleTextActive: { color: '#92400e' },
  adjustModeBanner: {
    position: 'absolute',
    top: 292,
    left: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(254,243,199,0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  adjustModeBannerText: { color: '#92400e', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  addressSearchWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  addressSearchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  addressSearchRow: { flexDirection: 'row', gap: 8 },
  addressInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  addressGoButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addressGoText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  addressError: { marginTop: 6, fontSize: 12, color: '#dc2626', paddingHorizontal: 4 },
  addressResults: {
    marginTop: 8,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  addressResultItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addressResultText: { fontSize: 13, color: '#111827' },
  marker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerDefault: { backgroundColor: '#10b981' },
  markerSelected: { backgroundColor: '#047857' },
  markerAdjustable: {
    borderColor: '#fcd34d',
    borderWidth: 3,
  },
  markerSaving: { opacity: 0.7 },
  markerPending: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 20,
  },
  plantListToggle: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  plantListToggleText: { color: '#065f46', fontSize: 14, fontWeight: '600' },
  plantListPanel: {
    position: 'absolute',
    bottom: 56,
    left: 12,
    right: 12,
    maxHeight: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  filterHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#064e3b',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterChips: { marginBottom: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  filterChipText: { fontSize: 12, color: '#374151' },
  filterChipTextActive: { color: '#047857', fontWeight: '600' },
  plantListEmpty: { padding: 12, fontSize: 13, color: '#6b7280', textAlign: 'center' },
  plantListRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  plantListItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  plantListJournalButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#fff',
  },
  plantListJournalText: { fontSize: 12, fontWeight: '600', color: '#047857' },
  plantListItemSelected: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  plantListName: { fontSize: 14, fontWeight: '600', color: '#064e3b' },
  plantListIndoor: { fontSize: 12, fontWeight: '500', color: '#6d28d9' },
  plantListCatalog: { fontSize: 12, fontWeight: '400', color: '#059669' },
  plantListCoords: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  errorText: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    color: '#dc2626',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#064e3b' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#374151', marginBottom: 4 },
  clearCatalogLink: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  catalogList: { maxHeight: 140, marginBottom: 8 },
  catalogItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  catalogItemSelected: { backgroundColor: '#ecfdf5' },
  catalogItemName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  catalogItemScientific: { fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
  catalogDetails: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  catalogDetailText: { fontSize: 12, color: '#374151', marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  indoorToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  indoorCheckbox: {
    marginTop: 2,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9ca3af',
    backgroundColor: '#fff',
  },
  indoorCheckboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  indoorToggleText: { flex: 1, fontSize: 14, color: '#374151' },
  markAllWateredButton: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  markAllWateredButtonText: { color: '#1e3a8a', fontWeight: '600', fontSize: 14 },
  noticeText: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  journalButton: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
  },
  journalButtonText: { color: '#047857', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  deleteButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#dc2626' },
  cancelText: { textAlign: 'center', marginTop: 14, color: '#6b7280' },
  buttonDisabled: { opacity: 0.5 },
});
