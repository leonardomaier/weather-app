import { useEffect, useState } from 'react'
import { ApiError, getWeather } from '../api/client'
import type { City, Units, WeatherReport } from '../api/types'

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; report: WeatherReport }
  | { status: 'error'; message: string }

export function useWeather(city: City | null, units: Units) {
  const [state, setState] = useState<WeatherState>({ status: 'idle' })

  useEffect(() => {
    if (!city) return

    const controller = new AbortController()
    setState({ status: 'loading' })

    getWeather(city, units, controller.signal)
      .then((report) => setState({ status: 'success', report }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof ApiError ? err.message : 'Something went wrong'
        setState({ status: 'error', message })
      })

    return () => controller.abort()
  }, [city, units])

  return state
}
