import type { City, Units, WeatherReport } from './types'

export class ApiError extends Error {
  readonly kind: 'not_found' | 'unavailable'

  constructor(kind: 'not_found' | 'unavailable', message: string) {
    super(message)
    this.kind = kind
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('unavailable', 'Could not reach the server')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    const kind = res.status === 404 ? 'not_found' : 'unavailable'
    throw new ApiError(kind, body?.error ?? 'Something went wrong')
  }
  return res.json() as Promise<T>
}

export function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  return get(`/api/cities?q=${encodeURIComponent(query)}`, signal)
}

export function getWeather(city: City, units: Units, signal?: AbortSignal): Promise<WeatherReport> {
  const params = new URLSearchParams({
    lat: String(city.lat),
    lon: String(city.lon),
    units,
  })
  return get(`/api/weather?${params}`, signal)
}
