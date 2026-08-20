import express from 'express'
import { geocodeCity, fetchCurrentWeather, fetchForecast, UpstreamError } from './openweather.js'
import { buildDailyForecast } from './forecast.js'
import { cached } from './cache.js'

function parseCoord(value) {
  if (typeof value !== 'string' || value.trim() === '') return NaN
  return Number(value)
}

function handleError(res, err) {
  if (err instanceof UpstreamError && err.status === 404) {
    res.status(404).json({ error: 'City not found' })
    return
  }
  if (err instanceof UpstreamError && err.status === 401) {
    console.error(
      `${err.message}. Either the key is not active yet (new keys take a while) ` +
        'or it does not cover this endpoint.',
    )
  } else {
    console.error(err)
  }
  res.status(502).json({ error: 'Weather service is unavailable, try again later' })
}

export function createApp({ staticDir } = {}) {
  const app = express()

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/api/cities', async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' })
      return
    }

    try {
      const matches = await geocodeCity(query)
      // the geo API frequently returns near-duplicate rows for the same place
      const seen = new Set()
      const cities = []
      for (const { name, country, state, lat, lon } of matches) {
        const key = `${name}|${state ?? ''}|${country}`
        if (seen.has(key)) continue
        seen.add(key)
        cities.push({ name, country, state, lat, lon })
      }
      res.json(cities)
    } catch (err) {
      handleError(res, err)
    }
  })

  app.get('/api/weather', async (req, res) => {
    const lat = parseCoord(req.query.lat)
    const lon = parseCoord(req.query.lon)
    const units = req.query.units ?? 'metric'

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.status(400).json({ error: 'Query parameters "lat" and "lon" are required numbers' })
      return
    }
    if (units !== 'metric' && units !== 'imperial') {
      res.status(400).json({ error: 'Query parameter "units" must be "metric" or "imperial"' })
      return
    }

    try {
      const { current, forecast } = await cached(`${lat},${lon},${units}`, async () => {
        const [currentRes, forecastRes] = await Promise.all([
          fetchCurrentWeather(lat, lon, units),
          fetchForecast(lat, lon, units),
        ])
        return {
          current: {
            temp: Math.round(currentRes.main.temp),
            condition: currentRes.weather[0].main,
            conditionCode: currentRes.weather[0].id,
            icon: currentRes.weather[0].icon,
          },
          forecast: buildDailyForecast(forecastRes.list, forecastRes.city.timezone),
        }
      })
      res.json({ current, forecast })
    } catch (err) {
      handleError(res, err)
    }
  })

  if (staticDir) {
    app.use(express.static(staticDir))
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile('index.html', { root: staticDir })
    })
  }

  return app
}
