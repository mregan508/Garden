import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  countPlacementsByLocation,
  fetchGardenWeather,
  formatForecastDay,
  isFrostRisk,
  isSubstantialRain,
  processRainAutoWatering,
  type GardenPlacement,
  type GardenWeatherForecast,
} from '@gardening/shared';

interface GardenWeatherProps {
  latitude: number;
  longitude: number;
  compact?: boolean;
  placements?: GardenPlacement[];
  userId?: string;
  supabase?: SupabaseClient;
  onRainAutoWatered?: (count: number) => void;
  getRainAutoWaterDate?: () => string | null;
  setRainAutoWaterDate?: (date: string) => void;
}

function WeatherContextNotes({
  forecast,
  outdoorCount,
  indoorCount,
}: {
  forecast: GardenWeatherForecast;
  outdoorCount: number;
  indoorCount: number;
}) {
  const today = forecast.daily[0];
  const substantialRain = isSubstantialRain(forecast) && outdoorCount > 0;
  const frostRisk = today && isFrostRisk(today.lowF) && outdoorCount > 0;

  return (
    <View style={styles.contextWrap}>
      {outdoorCount > 0 || indoorCount > 0 ? (
        <Text style={styles.contextText}>
          {outdoorCount} outdoor · {indoorCount} indoor
          {indoorCount > 0 ? ' (exempt from rain/cold alerts)' : ''}
        </Text>
      ) : null}
      {substantialRain ? (
        <Text style={styles.alertText}>
          Substantial rain — outdoor plants marked watered automatically
        </Text>
      ) : null}
      {frostRisk ? (
        <Text style={styles.frostText}>
          Frost possible tonight ({today.lowF}°F low) — protect outdoor plants
        </Text>
      ) : null}
    </View>
  );
}

export function GardenWeather({
  latitude,
  longitude,
  compact = false,
  placements = [],
  userId,
  supabase,
  onRainAutoWatered,
  getRainAutoWaterDate,
  setRainAutoWaterDate,
}: GardenWeatherProps) {
  const [forecast, setForecast] = useState<GardenWeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { indoor, outdoor } = useMemo(
    () => countPlacementsByLocation(placements),
    [placements]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchGardenWeather(latitude, longitude).then(({ data, error: fetchError }) => {
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setError(fetchError);
        setForecast(null);
        return;
      }
      setForecast(data);
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!forecast) return;
    if (!userId || !supabase || placements.length === 0 || !getRainAutoWaterDate || !setRainAutoWaterDate) {
      return;
    }

    let cancelled = false;
    void processRainAutoWatering(
      supabase,
      userId,
      placements,
      forecast,
      getRainAutoWaterDate()
    ).then(({ wateredCount, dateKey, error: rainError }) => {
      if (cancelled) return;
      if (rainError) {
        setError(rainError);
        return;
      }
      if (dateKey && wateredCount > 0) {
        setRainAutoWaterDate(dateKey);
        onRainAutoWatered?.(wateredCount);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    forecast,
    userId,
    supabase,
    placements,
    getRainAutoWaterDate,
    setRainAutoWaterDate,
    onRainAutoWatered,
  ]);

  if (loading) {
    return <Text style={styles.muted}>Loading weather...</Text>;
  }

  if (error || !forecast) {
    return <Text style={styles.muted}>{error ?? 'Weather unavailable'}</Text>;
  }

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <Text style={styles.compactTitle}>
          {forecast.current.temperatureF}°F · {forecast.current.weatherLabel}
        </Text>
        <Text style={styles.compactMeta}>Humidity {forecast.current.humidity}%</Text>
        <WeatherContextNotes forecast={forecast} outdoorCount={outdoor} indoorCount={indoor} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Garden weather</Text>
      <Text style={styles.currentTemp}>
        {forecast.current.temperatureF}°F{' '}
        <Text style={styles.currentLabel}>{forecast.current.weatherLabel}</Text>
      </Text>
      <Text style={styles.meta}>Humidity {forecast.current.humidity}%</Text>
      <WeatherContextNotes forecast={forecast} outdoorCount={outdoor} indoorCount={indoor} />
      <View style={styles.dailyRow}>
        {forecast.daily.map((day) => (
          <View key={day.date} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{formatForecastDay(day.date)}</Text>
            <Text style={styles.dayHigh}>{day.highF}°</Text>
            <Text style={styles.dayLow}>{day.lowF}°</Text>
            {day.precipChance > 0 ? (
              <Text style={styles.dayPrecip}>{day.precipChance}%</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  muted: { fontSize: 12, color: '#6b7280' },
  card: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    marginBottom: 12,
  },
  compactCard: {
    backgroundColor: 'rgba(239,246,255,0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentTemp: { fontSize: 20, fontWeight: '700', color: '#172554', marginTop: 4 },
  currentLabel: { fontSize: 14, fontWeight: '400', color: '#1e40af' },
  meta: { fontSize: 12, color: '#1d4ed8', marginTop: 2 },
  compactTitle: { fontSize: 14, fontWeight: '600', color: '#172554' },
  compactMeta: { fontSize: 11, color: '#1d4ed8', marginTop: 2 },
  contextWrap: { marginTop: 6, gap: 2 },
  contextText: { fontSize: 11, color: '#1d4ed8' },
  alertText: { fontSize: 11, fontWeight: '600', color: '#1e3a8a' },
  frostText: { fontSize: 11, fontWeight: '600', color: '#312e81' },
  dailyRow: { flexDirection: 'row', gap: 4, marginTop: 10 },
  dayCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dayLabel: { fontSize: 10, fontWeight: '600', color: '#1e3a8a' },
  dayHigh: { fontSize: 12, fontWeight: '700', color: '#172554' },
  dayLow: { fontSize: 10, color: '#1d4ed8' },
  dayPrecip: { fontSize: 10, color: '#2563eb' },
});
