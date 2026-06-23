'use client';

import { useEffect, useState } from 'react';
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
