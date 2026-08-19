interface WeatherIconProps {
  code: number
  icon: string
  label?: string
}

// weather-icons ships day/night classes keyed by OpenWeatherMap condition codes
export function WeatherIcon({ code, icon, label }: WeatherIconProps) {
  const variant = icon.endsWith('n') ? 'night' : 'day'
  return (
    <i
      className={`wi wi-owm-${variant}-${code}`}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
    />
  )
}
