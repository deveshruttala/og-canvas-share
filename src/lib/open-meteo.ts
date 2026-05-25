export type OpenMeteoCurrent = {
  temperature: number
  weatherCode: number
  unit: string
  windSpeed?: number
  windUnit?: string
  label: string
}

export type OpenMeteoDay = {
  date: string
  max: number
  min: number
  code: number
}

const WMO_ICONS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  95: '⛈️',
}

export function weatherIcon(code: number): string {
  return WMO_ICONS[code] ?? '🌡️'
}

const WMO_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  80: 'Showers',
  95: 'Thunderstorm',
}

export function weatherLabel(code: number): string {
  return WMO_LABELS[code] ?? 'Current conditions'
}

export async function geocodePlace(name: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const q = name.trim()
  if (!q) return null
  const params = new URLSearchParams({ name: q, count: '1', language: 'en', format: 'json' })
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
  if (!res.ok) return null
  const data = (await res.json()) as {
    results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>
  }
  const hit = data.results?.[0]
  if (!hit) return null
  return {
    lat: hit.latitude,
    lon: hit.longitude,
    label: hit.country ? `${hit.name}, ${hit.country}` : hit.name,
  }
}

export async function fetchWeatherBundle(
  lat: number,
  lon: number,
): Promise<{ current: OpenMeteoCurrent; forecast: OpenMeteoDay[] } | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: '4',
    timezone: 'auto',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) return null
  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number; wind_speed_10m?: number }
    current_units?: { temperature_2m?: string; wind_speed_10m?: string }
    daily?: {
      time?: string[]
      weather_code?: number[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
    }
  }
  const temp = data.current?.temperature_2m
  const code = data.current?.weather_code
  if (temp == null || code == null) return null

  const forecast: OpenMeteoDay[] = []
  const times = data.daily?.time ?? []
  for (let i = 1; i < Math.min(4, times.length); i++) {
    forecast.push({
      date: times[i]!,
      max: Math.round(data.daily?.temperature_2m_max?.[i] ?? 0),
      min: Math.round(data.daily?.temperature_2m_min?.[i] ?? 0),
      code: data.daily?.weather_code?.[i] ?? 0,
    })
  }

  return {
    current: {
      temperature: Math.round(temp),
      weatherCode: code,
      unit: data.current_units?.temperature_2m ?? '°C',
      windSpeed: data.current?.wind_speed_10m != null ? Math.round(data.current.wind_speed_10m) : undefined,
      windUnit: data.current_units?.wind_speed_10m ?? 'km/h',
      label: weatherLabel(code),
    },
    forecast,
  }
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<OpenMeteoCurrent | null> {
  const bundle = await fetchWeatherBundle(lat, lon)
  return bundle?.current ?? null
}
