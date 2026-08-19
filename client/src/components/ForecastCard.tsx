import { WeatherIcon } from './WeatherIcon'
import type { ForecastDay } from '../api/types'
import styles from './ForecastCard.module.css'

export function ForecastCard({ day }: { day: ForecastDay }) {
  return (
    <li className={styles.card}>
      <h3 className={styles.day}>{day.dayLabel}</h3>
      <WeatherIcon code={day.conditionCode} icon={day.icon} label={day.condition} />
      <div className={styles.temps}>
        <div className={styles.temp}>
          <span>L</span>
          <span>{day.min}&deg;</span>
        </div>
        <div className={styles.temp}>
          <span>H</span>
          <span>{day.max}&deg;</span>
        </div>
      </div>
    </li>
  )
}
