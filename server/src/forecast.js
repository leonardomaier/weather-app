const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Shifts a unix timestamp by the city's UTC offset so the UTC accessors
// of the resulting Date give local calendar values.
function toLocalDate(unixSeconds, timezoneOffset) {
  return new Date((unixSeconds + timezoneOffset) * 1000)
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

export function buildDailyForecast(entries, timezoneOffset, nowUnix = Date.now() / 1000) {
  const days = new Map()

  for (const entry of entries) {
    const local = toLocalDate(entry.dt, timezoneOffset)
    const key = dateKey(local)
    if (!days.has(key)) {
      days.set(key, { date: key, weekday: WEEKDAYS[local.getUTCDay()], entries: [] })
    }
    days.get(key).entries.push({ ...entry, localHour: local.getUTCHours() })
  }

  const todayKey = dateKey(toLocalDate(nowUnix, timezoneOffset))

  return [...days.values()].slice(0, 5).map((day) => {
    const midday = day.entries.reduce((closest, entry) =>
      Math.abs(entry.localHour - 12) < Math.abs(closest.localHour - 12) ? entry : closest,
    )
    return {
      date: day.date,
      dayLabel: day.date === todayKey ? 'Today' : day.weekday,
      min: Math.round(Math.min(...day.entries.map((e) => e.main.temp_min))),
      max: Math.round(Math.max(...day.entries.map((e) => e.main.temp_max))),
      condition: midday.weather[0].main,
      conditionCode: midday.weather[0].id,
      icon: midday.weather[0].icon,
    }
  })
}
