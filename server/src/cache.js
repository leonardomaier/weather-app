const TTL_MS = 10 * 60 * 1000

const store = new Map()

export function cached(key, produce) {
  const hit = store.get(key)
  if (hit) {
    if (hit.expires > Date.now()) return hit.value
    store.delete(key)
  }
  const value = produce()
  store.set(key, { value, expires: Date.now() + TTL_MS })
  // don't keep failed lookups around for the whole TTL
  Promise.resolve(value).catch(() => store.delete(key))
  return value
}
