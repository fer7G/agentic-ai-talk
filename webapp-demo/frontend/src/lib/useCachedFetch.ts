import { useEffect, useState } from 'react'

const cache = new Map<string, unknown>()

export function useCachedFetch<T>(key: string | null, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(key && cache.has(key) ? (cache.get(key) as T) : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!key) return
    if (cache.has(key)) {
      setData(cache.get(key) as T)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((result) => {
        if (cancelled) return
        cache.set(key, result)
        setData(result)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { data, loading, error }
}
