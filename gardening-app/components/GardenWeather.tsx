import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  fetchGardenWeather,
  formatForecastDay,
  type GardenWeatherForecast,
} from '@gardening/shared';

interface GardenWeatherProps {
  latitude: number;
  longitude: number;
  compact?: boolean;
}

export function GardenWeather({ latitude, longitude, compact = false }: GardenWeatherProps) {
  const [forecast, setForecast] = useState<GardenWeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        setForecast(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

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
