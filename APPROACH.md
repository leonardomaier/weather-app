# Approach

A short walkthrough of how I built this and why it looks the way it does.

## Order of work

The part this exercise actually grades is the UI: layout, CSS, components, and how
data moves through the screen. The server is a thin proxy in front of OpenWeatherMap.
So I started from the reference image, not from Express.

1. **UI against a Chicago mock.** The screenshot is Chicago at 80° with a 5-day forecast,
   so I hardcoded that shape first: city name, current temp/condition/icon, and five
   daily cards (label, min, max, icon). Search, current weather, and forecast were
   built as small components on top of that mock. That meant I could match the design
   and the empty/loading/error states without waiting on a key or a live API.

2. **A payload the UI already understood.** Once the screen looked right, the mock
   became the contract. The client expects `{ current, forecast }`, not OpenWeatherMap's
   40 three-hour slots. The server's job is to produce that same JSON so swapping the
   mock for `fetch` did not change the components.

3. **Then the proxy.** A small Express app hides the API key, geocodes the city name,
   loads current weather + the 5-day forecast, and folds the 3-hourly entries into five
   days (`buildDailyForecast`: group by calendar day in the city's timezone, min/max
   for the day, condition from the slot closest to local midday). Vite proxies `/api`
   in dev; in production Express serves the built client.

4. **Wire-up.** Typed `fetch` helpers, a debounced city search, and a `useWeather` hook
   with a simple state machine (idle / loading / success / error). After that the UI
   was already pointed at the right shape, so plugging the server in was mostly
   replacing the mock.

5. **Tests where they earn their keep.** Timezone grouping in `buildDailyForecast`,
   route error mapping with the upstream mocked, and the main UI flows with the API
   client mocked. No snapshot tests, no coverage padding.

## Decisions worth explaining

**Why a Node server at all?** The OpenWeatherMap key should not sit in the browser, and
the client should not have to know about 3-hour forecast buckets. The proxy also
caches responses for 10 minutes so repeated searches do not burn the free tier.

**Why no state library?** The whole app is one selected city and one request lifecycle.
A discriminated union in a hook is enough. Redux would be ceremony.

**Why plain CSS Modules?** CSS is part of what they grade. A utility framework would
hide that. Modules keep styles scoped without a runtime.

**Units.** The reference shows Chicago at 80°, so the app asks for imperial. The server
already accepts `units=metric` — a toggle is the first thing I would add with more time.

## What I'd do with more time

A °C/°F toggle (the API side is done), geolocation for a default city on first load,
and remembering the last searched city in localStorage. Those were scope cuts, not
things I ran out of time on.
