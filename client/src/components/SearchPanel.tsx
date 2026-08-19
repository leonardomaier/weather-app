import { useEffect, useRef, useState } from 'react'
import { DISCLAIMER_GENERAL } from '../content/disclaimer'
import type { City } from '../api/types'
import styles from './SearchPanel.module.css'

interface SearchPanelProps {
  query: string
  onQueryChange: (query: string) => void
  suggestions: City[]
  onSelect: (city: City) => void
}

function cityLabel(city: City) {
  return `${city.name}${city.state ? `, ${city.state}` : ''}`
}

export function SearchPanel({ query, onQueryChange, suggestions, onSelect }: SearchPanelProps) {
  const [dismissed, setDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRef = useRef<HTMLElement>(null)

  const open = !dismissed && suggestions.length > 0

  useEffect(() => {
    function closeOnOutsideClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setDismissed(true)
      }
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  function handleQueryChange(value: string) {
    setDismissed(false)
    setActiveIndex(0)
    onQueryChange(value)
  }

  function select(city: City) {
    setDismissed(true)
    onSelect(city)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setDismissed(true)
    }
  }

  return (
    <aside className={styles.panel} ref={panelRef}>
      <h2 className={styles.heading}>Search</h2>
      <input
        className={styles.input}
        type="text"
        placeholder="Search by city"
        autoComplete="off"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-label="Search by city"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="city-suggestions"
        aria-activedescendant={open ? `city-option-${activeIndex}` : undefined}
      />
      {open && (
        <ul
          className={styles.suggestions}
          role="listbox"
          id="city-suggestions"
          aria-label="City suggestions"
        >
          {suggestions.map((city, i) => (
            <li
              key={`${city.lat},${city.lon}`}
              id={`city-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={i === activeIndex ? styles.optionActive : styles.option}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                select(city)
              }}
            >
              {cityLabel(city)} <span>{city.country}</span>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.disclaimer}>{DISCLAIMER_GENERAL}</p>
    </aside>
  )
}
