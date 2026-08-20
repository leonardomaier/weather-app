import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'

if (!process.env.OPENWEATHER_API_KEY) {
  console.error('OPENWEATHER_API_KEY is not set. Copy .env.example to .env and add your key.')
  process.exit(1)
}

const port = process.env.PORT ?? 3001

const staticDir =
  process.env.NODE_ENV === 'production'
    ? fileURLToPath(new URL('../../client/dist', import.meta.url))
    : undefined

createApp({ staticDir }).listen(port, () => {
  console.log(`API server listening on port ${port}`)
})
