export interface City {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

export interface CurrentWeather {
  temp: number
  condition: string
  conditionCode: number
  icon: string
}

export interface ForecastDay {
  date: string
  dayLabel: string
  min: number
  max: number
  condition: string
  conditionCode: number
  icon: string
}

export interface WeatherReport {
  current: CurrentWeather
  forecast: ForecastDay[]
}

export type Units = 'metric' | 'imperial'
