import { ForecastCard } from './ForecastCard'
import type { ForecastDay } from '../api/types'
import styles from './ForecastList.module.css'

export function ForecastList({ days }: { days: ForecastDay[] }) {
  return (
    <section className={styles.section} aria-label="5-day forecast">
      <h2 className={styles.heading}>5-Day Forecast</h2>
      <ul className={styles.list}>
        {days.map((day) => (
          <ForecastCard key={day.date} day={day} />
        ))}
      </ul>
    </section>
  )
}
