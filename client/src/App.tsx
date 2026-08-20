import { useState } from 'react'
import { SearchPanel } from './components/SearchPanel'
import { CurrentWeather } from './components/CurrentWeather'
import { ForecastList } from './components/ForecastList'
import { useCitySearch } from './hooks/useCitySearch'
import { useWeather } from './hooks/useWeather'
import { DISCLAIMER_LIABILITY } from './content/disclaimer'
import type { City, Units } from './api/types'
import styles from './App.module.css'

// the reference design shows Fahrenheit (Chicago at 80°)
const UNITS: Units = 'imperial'

function App() {
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const suggestions = useCitySearch(query)
  const weather = useWeather(selectedCity, UNITS)

  function selectCity(city: City) {
    setSelectedCity(city)
    setQuery('')
  }

  return (
    <div className={styles.app}>
      <SearchPanel
        query={query}
        onQueryChange={setQuery}
        suggestions={suggestions}
        onSelect={selectCity}
      />

      <main className={styles.main}>
        <h1 className={styles.title}>Weather</h1>

        <div className={styles.content}>
          {weather.status === 'idle' && (
            <p className={styles.message}>Search for a city to see the forecast</p>
          )}
          {weather.status === 'loading' && (
            <span className={styles.spinner} role="status" aria-label="Loading forecast" />
          )}
          {weather.status === 'error' && <p className={styles.message}>{weather.message}</p>}
          {weather.status === 'success' && selectedCity && (
            <>
              <CurrentWeather cityName={selectedCity.name} current={weather.report.current} />
              <ForecastList days={weather.report.forecast} />
            </>
          )}
        </div>

        <p className={styles.disclaimer}>{DISCLAIMER_LIABILITY}</p>
      </main>
    </div>
  )
}

export default App
