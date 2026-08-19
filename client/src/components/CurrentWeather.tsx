import { WeatherIcon } from './WeatherIcon'
import type { CurrentWeather as CurrentWeatherData } from '../api/types'
import styles from './CurrentWeather.module.css'

interface CurrentWeatherProps {
  cityName: string
  current: CurrentWeatherData
}

export function CurrentWeather({ cityName, current }: CurrentWeatherProps) {
  return (
    <section className={styles.current} aria-label="Current weather">
      <WeatherIcon code={current.conditionCode} icon={current.icon} label={current.condition} />
      <h2 className={styles.city}>{cityName}</h2>
      <p className={styles.temp}>{current.temp}&deg;</p>
    </section>
  )
}
