export interface CurrentWeather {
  temperatureF: number;
  humidity: number;
  precipitationIn: number;
  weatherCode: number;
  weatherLabel: string;
}

export interface DailyForecast {
  date: string;
  highF: number;
  lowF: number;
  precipChance: number;
  weatherCode: number;
  weatherLabel: string;
}

export interface GardenWeatherForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast[];
}

const WMO_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

export function weatherCodeLabel(code: number): string {
  return WMO_LABELS[code] ?? 'Unknown';
}

export function gardenCenter(
  placements: { latitude: number; longitude: number }[]
): { latitude: number; longitude: number } | null {
  if (placements.length === 0) return null;
  const latitude =
    placements.reduce((sum, p) => sum + p.latitude, 0) / placements.length;
  const longitude =
    placements.reduce((sum, p) => sum + p.longitude, 0) / placements.length;
  return { latitude, longitude };
}

export async function fetchGardenWeather(
  latitude: number,
  longitude: number
): Promise<{ data: GardenWeatherForecast | null; error: string | null }> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    precipitation_unit: 'inch',
    timezone: 'auto',
    forecast_days: '5',
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) {
      return { data: null, error: 'Weather forecast unavailable' };
    }

    const json = (await response.json()) as {
      latitude: number;
      longitude: number;
      timezone: string;
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        precipitation: number;
        weather_code: number;
      };
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
      };
    };

    const currentCode = json.current.weather_code;
    const daily: DailyForecast[] = json.daily.time.map((date, i) => ({
      date,
      highF: Math.round(json.daily.temperature_2m_max[i] ?? 0),
      lowF: Math.round(json.daily.temperature_2m_min[i] ?? 0),
      precipChance: json.daily.precipitation_probability_max[i] ?? 0,
      weatherCode: json.daily.weather_code[i] ?? 0,
      weatherLabel: weatherCodeLabel(json.daily.weather_code[i] ?? 0),
    }));

    return {
      data: {
        latitude: json.latitude,
        longitude: json.longitude,
        timezone: json.timezone,
        current: {
          temperatureF: Math.round(json.current.temperature_2m),
          humidity: json.current.relative_humidity_2m,
          precipitationIn: json.current.precipitation,
          weatherCode: currentCode,
          weatherLabel: weatherCodeLabel(currentCode),
        },
        daily,
      },
      error: null,
    };
  } catch {
    return { data: null, error: 'Failed to load weather forecast' };
  }
}

export function formatForecastDay(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfDate.getTime() - startOfToday.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}
