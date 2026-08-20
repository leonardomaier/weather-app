import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildDailyForecast } from '../src/forecast.js'

function entry(dt, tempMin, tempMax, icon = '01d', main = 'Clear', id = 800) {
  return { dt, main: { temp_min: tempMin, temp_max: tempMax }, weather: [{ id, main, icon }] }
}

function utc(year, month, day, hour) {
  return Date.UTC(year, month - 1, day, hour) / 1000
}

describe('buildDailyForecast', () => {
  it('groups entries by calendar day in the city timezone', () => {
    const tz = 13 * 3600 // UTC+13, e.g. Nuku'alofa
    const entries = [
      // 09:00 UTC is still Aug 20 at 22:00 local
      entry(utc(2026, 8, 20, 9), 10, 15),
      // 12:00 UTC has crossed midnight to Aug 21 at 01:00 local
      entry(utc(2026, 8, 20, 12), 8, 12),
    ]
    const days = buildDailyForecast(entries, tz, utc(2026, 8, 20, 9))
    assert.equal(days.length, 2)
    assert.equal(days[0].date, '2026-08-20')
    assert.equal(days[1].date, '2026-08-21')
  })

  it('aggregates min and max across the whole day', () => {
    const entries = [
      entry(utc(2026, 8, 20, 6), 12, 16),
      entry(utc(2026, 8, 20, 12), 18, 24),
      entry(utc(2026, 8, 20, 18), 14, 20),
    ]
    const [day] = buildDailyForecast(entries, 0, utc(2026, 8, 20, 6))
    assert.equal(day.min, 12)
    assert.equal(day.max, 24)
  })

  it('labels the current local day as Today and the rest with weekday names', () => {
    const entries = [
      entry(utc(2026, 8, 20, 12), 10, 20), // a Thursday
      entry(utc(2026, 8, 21, 12), 10, 20),
    ]
    const days = buildDailyForecast(entries, 0, utc(2026, 8, 20, 10))
    assert.equal(days[0].dayLabel, 'Today')
    assert.equal(days[1].dayLabel, 'Friday')
  })

  it('does not label any day as Today when the first entry is tomorrow', () => {
    const entries = [entry(utc(2026, 8, 21, 0), 10, 20)]
    const days = buildDailyForecast(entries, 0, utc(2026, 8, 20, 23))
    assert.equal(days[0].dayLabel, 'Friday')
  })

  it('caps the result at five days', () => {
    const entries = []
    for (let i = 0; i < 56; i++) {
      entries.push(entry(utc(2026, 8, 20, 0) + i * 3 * 3600, 10, 20))
    }
    const days = buildDailyForecast(entries, 0, utc(2026, 8, 20, 0))
    assert.equal(days.length, 5)
  })

  it('takes the condition from the entry closest to local midday', () => {
    const entries = [
      entry(utc(2026, 8, 20, 6), 10, 20, '10d', 'Rain', 500),
      entry(utc(2026, 8, 20, 12), 10, 20, '01d', 'Clear', 800),
      entry(utc(2026, 8, 20, 21), 10, 20, '04d', 'Clouds', 803),
    ]
    const [day] = buildDailyForecast(entries, 0, utc(2026, 8, 20, 6))
    assert.equal(day.icon, '01d')
    assert.equal(day.condition, 'Clear')
  })
})
