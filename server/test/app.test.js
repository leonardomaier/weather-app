import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

let server
let base
let upstream

const realFetch = globalThis.fetch

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function currentFixture() {
  return {
    name: 'Chicago',
    main: { temp: 80.3 },
    weather: [{ id: 800, main: 'Clear', icon: '01d' }],
  }
}

function forecastFixture() {
  const start = Date.UTC(2026, 7, 20) / 1000
  const list = []
  for (let i = 0; i < 40; i++) {
    list.push({
      dt: start + i * 3 * 3600,
      main: { temp_min: 69.2, temp_max: 80.8 },
      weather: [{ id: 803, main: 'Clouds', icon: '04d' }],
    })
  }
  return { list, city: { timezone: -18000 } }
}

before(() => {
  globalThis.fetch = (url, opts) => {
    const parsed = new URL(url)
    if (parsed.hostname === 'api.openweathermap.org') {
      return Promise.resolve(upstream(parsed))
    }
    return realFetch(url, opts)
  }
  server = createApp().listen(0)
  base = `http://localhost:${server.address().port}`
})

after(() => {
  globalThis.fetch = realFetch
  server.close()
})

describe('GET /api/cities', () => {
  it('rejects a missing query', async () => {
    const res = await fetch(`${base}/api/cities`)
    assert.equal(res.status, 400)
    const body = await res.json()
    assert.ok(body.error)
  })

  it('returns trimmed city matches', async () => {
    upstream = () =>
      json([{ name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.9, lon: -87.6, extra: 1 }])
    const res = await fetch(`${base}/api/cities?q=chicago`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.deepEqual(body, [
      { name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.9, lon: -87.6 },
    ])
  })

  it('normalizes "city, state, country" queries for the geo api', async () => {
    let requestedQ
    upstream = (url) => {
      requestedQ = url.searchParams.get('q')
      return json([])
    }
    await fetch(`${base}/api/cities?q=${encodeURIComponent('Chicago, IL, US')}`)
    assert.equal(requestedQ, 'Chicago,IL,US')
  })

  it('drops duplicate places from the results', async () => {
    const row = { name: 'Springfield', country: 'US', state: 'Illinois', lat: 39.8, lon: -89.6 }
    upstream = () => json([row, { ...row, local_names: { en: 'Springfield' } }])
    const res = await fetch(`${base}/api/cities?q=springfield`)
    const body = await res.json()
    assert.equal(body.length, 1)
  })
})

describe('GET /api/weather', () => {
  it('rejects missing coordinates', async () => {
    const res = await fetch(`${base}/api/weather`)
    assert.equal(res.status, 400)
  })

  it('rejects empty coordinate strings', async () => {
    const res = await fetch(`${base}/api/weather?lat=&lon=`)
    assert.equal(res.status, 400)
  })

  it('rejects unknown units', async () => {
    const res = await fetch(`${base}/api/weather?lat=1&lon=2&units=kelvin`)
    assert.equal(res.status, 400)
  })

  it('maps upstream failures to 502', async () => {
    upstream = () => json({ message: 'boom' }, 500)
    const res = await fetch(`${base}/api/weather?lat=10&lon=20&units=metric`)
    assert.equal(res.status, 502)
    const body = await res.json()
    assert.ok(body.error)
  })

  it('maps an unknown location to 404', async () => {
    upstream = () => json({ message: 'not found' }, 404)
    const res = await fetch(`${base}/api/weather?lat=11&lon=21&units=metric`)
    assert.equal(res.status, 404)
  })

  it('combines current weather and a five day forecast', async () => {
    upstream = (url) =>
      json(url.pathname.endsWith('/weather') ? currentFixture() : forecastFixture())
    const res = await fetch(`${base}/api/weather?lat=41.9&lon=-87.6&units=imperial`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.deepEqual(body.current, {
      temp: 80,
      condition: 'Clear',
      conditionCode: 800,
      icon: '01d',
    })
    assert.equal(body.forecast.length, 5)
    for (const day of body.forecast) {
      assert.equal(day.min, 69)
      assert.equal(day.max, 81)
      assert.equal(day.icon, '04d')
      assert.ok(day.dayLabel)
    }
  })
})
