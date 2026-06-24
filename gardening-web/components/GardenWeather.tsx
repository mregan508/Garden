'use client';

import { useEffect, useMemo, useState } from 'react';
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
    <div className="mt-2 space-y-1">
      {outdoorCount > 0 || indoorCount > 0 ? (
        <p className="text-xs text-sky-700">
          {outdoorCount} outdoor · {indoorCount} indoor
          {indoorCount > 0 ? ' (exempt from rain/cold alerts)' : ''}
        </p>
      ) : null}
      {substantialRain ? (
        <p className="text-xs font-medium text-sky-900">
          Substantial rain — outdoor plants marked watered automatically
        </p>
      ) : null}
      {frostRisk ? (
        <p className="text-xs font-medium text-indigo-900">
          Frost possible tonight ({today.lowF}°F low) — protect outdoor plants
        </p>
      ) : null}
    </div>
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
    return <p className="text-xs text-gray-500">Loading weather...</p>;
  }

  if (error || !forecast) {
    return <p className="text-xs text-gray-500">{error ?? 'Weather unavailable'}</p>;
  }

  if (compact) {
    return (
      <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm">
        <p className="font-medium text-sky-900">
          {forecast.current.temperatureF}°F · {forecast.current.weatherLabel}
        </p>
        <p className="text-xs text-sky-700">
          Humidity {forecast.current.humidity}%
          {forecast.current.precipitationIn > 0
            ? ` · ${forecast.current.precipitationIn}" rain now`
            : ''}
        </p>
        <WeatherContextNotes forecast={forecast} outdoorCount={outdoor} indoorCount={indoor} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-800">
        Garden weather
      </h3>
      <p className="mt-1 text-lg font-semibold text-sky-950">
        {forecast.current.temperatureF}°F
        <span className="ml-2 text-sm font-normal text-sky-800">
          {forecast.current.weatherLabel}
        </span>
      </p>
      <p className="text-xs text-sky-700">
        Humidity {forecast.current.humidity}%
        {forecast.current.precipitationIn > 0
          ? ` · ${forecast.current.precipitationIn}" precipitation`
          : ''}
      </p>
      <WeatherContextNotes forecast={forecast} outdoorCount={outdoor} indoorCount={indoor} />
      <div className="mt-3 grid grid-cols-5 gap-1">
        {forecast.daily.map((day) => (
          <div key={day.date} className="rounded bg-white/70 px-1 py-1.5 text-center">
            <p className="text-[10px] font-medium text-sky-900">{formatForecastDay(day.date)}</p>
            <p className="text-xs font-semibold text-sky-950">{day.highF}°</p>
            <p className="text-[10px] text-sky-700">{day.lowF}°</p>
            {day.precipChance > 0 ? (
              <p className="text-[10px] text-sky-600">{day.precipChance}%</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
