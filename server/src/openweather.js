const BASE_URL = 'https://api.openweathermap.org'

export class UpstreamError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, params) {
  const url = new URL(path, BASE_URL)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY)

  const res = await fetch(url)
  if (!res.ok) {
    throw new UpstreamError(res.status, `openweathermap responded with ${res.status} for ${path}`)
  }
  return res.json()
}

export function geocodeCity(query, limit = 10) {
  // the geo API expects "city,state,country" with no spaces around the commas
  const q = query
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(',')
  return request('/geo/1.0/direct', { q, limit })
}

export function fetchCurrentWeather(lat, lon, units) {
  return request('/data/2.5/weather', { lat, lon, units })
}

export function fetchForecast(lat, lon, units) {
  return request('/data/2.5/forecast', { lat, lon, units })
}
