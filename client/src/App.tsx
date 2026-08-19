import { useState } from 'react'
import { SearchPanel } from './components/SearchPanel'
import { CurrentWeather } from './components/CurrentWeather'
import { ForecastList } from './components/ForecastList'
import { DISCLAIMER_LIABILITY } from './content/disclaimer'
import type { City } from './api/types'
import { MOCK_CITIES, MOCK_REPORT } from './mock/chicago'
import styles from './App.module.css'

function App() {
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  const trimmed = query.trim().toLowerCase()
  const suggestions =
    trimmed.length < 2
      ? []
      : MOCK_CITIES.filter((city) => city.name.toLowerCase().includes(trimmed))

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
          {!selectedCity && (
            <p className={styles.message}>Search for a city to see the forecast</p>
          )}
          {selectedCity && (
            <>
              <CurrentWeather cityName={selectedCity.name} current={MOCK_REPORT.current} />
              <ForecastList days={MOCK_REPORT.forecast} />
            </>
          )}
        </div>

        <p className={styles.disclaimer}>{DISCLAIMER_LIABILITY}</p>
      </main>
    </div>
  )
}

export default App
