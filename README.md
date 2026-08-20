# Weather Forecast

Search for any city and get the current weather plus a 5-day forecast. Built with React,
TypeScript and a small Node/Express server that proxies the OpenWeatherMap API.

## Prerequisites

- Node.js 22.9 or newer (the server uses `--env-file-if-exists`)
- A free OpenWeatherMap API key: https://home.openweathermap.org/api_keys

## Setup

```bash
npm install
cp .env.example .env
# open .env and paste your key into OPENWEATHER_API_KEY
```

Note: a freshly created OpenWeatherMap key can take a few minutes to become active.

## Development

```bash
npm run dev
```

Starts the API server on http://localhost:3001 and the Vite dev server on
http://localhost:5173 (requests to `/api` are proxied to the server). Open
http://localhost:5173 in the browser.

## Tests

```bash
npm test
```

Runs the server tests (node:test) and the client tests (Vitest + Testing Library).

## Production

```bash
npm run build
npm start
```

Builds the client and serves everything (static files + API) from a single Express
process on http://localhost:3001.

## Project structure

```
client/            React + TypeScript app (Vite)
  src/api/         typed API client and shared types
  src/hooks/       useCitySearch (debounced), useWeather (state machine)
  src/components/  SearchPanel, CurrentWeather, ForecastList, ForecastCard, WeatherIcon
server/            Node/Express API
  src/openweather.js  OpenWeatherMap client (key stays server-side)
  src/forecast.js     3-hourly -> daily forecast normalization
  src/app.js          routes and error mapping
  test/               unit and route tests
```
