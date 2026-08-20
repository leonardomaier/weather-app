import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ApiError, getWeather, searchCities } from './api/client'
import type { City, WeatherReport } from './api/types'

vi.mock('./api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api/client')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}))

const chicago: City = { name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.9, lon: -87.6 }

const report: WeatherReport = {
  current: { temp: 80, condition: 'Clear', conditionCode: 800, icon: '01d' },
  forecast: ['Today', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((dayLabel, i) => ({
    date: `2026-08-2${i}`,
    dayLabel,
    min: 69,
    max: 81,
    condition: 'Clouds',
    conditionCode: 803,
    icon: '04d',
  })),
}

async function searchAndSelectChicago() {
  await userEvent.type(screen.getByRole('combobox'), 'Chic')
  await userEvent.click(await screen.findByRole('option', { name: /chicago/i }))
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('city search', () => {
  it('debounces typing into a single request and shows suggestions', async () => {
    vi.mocked(searchCities).mockResolvedValue([chicago])
    render(<App />)

    await userEvent.type(screen.getByRole('combobox'), 'Chic')

    expect(await screen.findByRole('option', { name: /chicago/i })).toBeInTheDocument()
    expect(searchCities).toHaveBeenCalledTimes(1)
    expect(searchCities).toHaveBeenCalledWith('Chic', expect.anything())
  })

  it('clears suggestions when a later lookup fails', async () => {
    vi.mocked(searchCities)
      .mockResolvedValueOnce([chicago])
      .mockRejectedValueOnce(new ApiError('unavailable', 'Could not reach the server'))
    render(<App />)

    await userEvent.type(screen.getByRole('combobox'), 'Chic')
    expect(await screen.findByRole('option', { name: /chicago/i })).toBeInTheDocument()

    await userEvent.type(screen.getByRole('combobox'), 'x')
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /chicago/i })).not.toBeInTheDocument()
    })
  })
})

describe('weather report', () => {
  it('shows the current weather and five forecast cards after selecting a city', async () => {
    vi.mocked(searchCities).mockResolvedValue([chicago])
    vi.mocked(getWeather).mockResolvedValue(report)
    render(<App />)

    await searchAndSelectChicago()

    expect(await screen.findByRole('heading', { name: 'Chicago' })).toBeInTheDocument()
    expect(screen.getByText('80°')).toBeInTheDocument()

    const forecast = screen.getByRole('region', { name: /5-day forecast/i })
    expect(within(forecast).getAllByRole('listitem')).toHaveLength(5)
    expect(within(forecast).getByText('Today')).toBeInTheDocument()
  })

  it('shows the error message when the forecast cannot be loaded', async () => {
    vi.mocked(searchCities).mockResolvedValue([chicago])
    vi.mocked(getWeather).mockRejectedValue(new ApiError('unavailable', 'Could not reach the server'))
    render(<App />)

    await searchAndSelectChicago()

    expect(await screen.findByText('Could not reach the server')).toBeInTheDocument()
  })
})
