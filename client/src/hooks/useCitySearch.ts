import { useEffect, useState } from 'react'
import { searchCities } from '../api/client'
import type { City } from '../api/types'

const DEBOUNCE_MS = 300

export function useCitySearch(query: string) {
  const [suggestions, setSuggestions] = useState<City[]>([])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchCities(trimmed, controller.signal)
        .then(setSuggestions)
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setSuggestions([])
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return suggestions
}
