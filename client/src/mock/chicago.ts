import type { City, WeatherReport } from '../api/types'

export const MOCK_CITIES: City[] = [
  { name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.85, lon: -87.65 },
  { name: 'Chicago Heights', country: 'US', state: 'Illinois', lat: 41.51, lon: -87.64 },
  { name: 'Chicago Ridge', country: 'US', state: 'Illinois', lat: 41.7, lon: -87.78 },
]

// numbers taken from the reference screenshot
export const MOCK_REPORT: WeatherReport = {
  current: { temp: 80, condition: 'Clear', conditionCode: 800, icon: '01d' },
  forecast: [
    { date: '2026-08-20', dayLabel: 'Today', min: 69, max: 81, condition: 'Clouds', conditionCode: 803, icon: '04d' },
    { date: '2026-08-21', dayLabel: 'Friday', min: 69, max: 81, condition: 'Clouds', conditionCode: 803, icon: '04d' },
    { date: '2026-08-22', dayLabel: 'Saturday', min: 69, max: 81, condition: 'Clear', conditionCode: 800, icon: '01d' },
    { date: '2026-08-23', dayLabel: 'Sunday', min: 69, max: 81, condition: 'Clouds', conditionCode: 803, icon: '04d' },
    { date: '2026-08-24', dayLabel: 'Monday', min: 69, max: 81, condition: 'Clear', conditionCode: 800, icon: '01d' },
  ],
}
