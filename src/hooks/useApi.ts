'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { ApiError } from '@/lib/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

// Client-side data fetching hook with loading/error state.
// fn is a stable function reference (or deps array causes re-fetch).
// Waits for NextAuth session to initialize before running query to ensure auth token is available.
export function useApi<T>(
  fn: (() => Promise<T>) | null,
  deps: unknown[] = [],
): UseApiState<T> & { refetch: () => void } {
  const { status } = useSession()
  const isSessionReady = status !== 'loading'

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: fn !== null && isSessionReady,
    error: null,
  })

  const fetchIdRef = useRef(0)

  const execute = useCallback(async () => {
    if (!fn || !isSessionReady) return
    const currentId = ++fetchIdRef.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fn()
      if (fetchIdRef.current === currentId) {
        setState({ data, loading: false, error: null })
      }
    } catch (err) {
      if (fetchIdRef.current === currentId) {
        setState({
          data: null,
          loading: false,
          error: err instanceof ApiError ? err : new ApiError('UNKNOWN', String(err)),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, isSessionReady])

  useEffect(() => {
    execute()
  }, [execute])

  return { ...state, refetch: execute }
}

// Mutation hook for POST/PUT/PATCH/DELETE operations
export function useApiMutation<TData, TArgs = void>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(async (fn: (args: TArgs) => Promise<TData>, args: TArgs): Promise<TData | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(args)
      setLoading(false)
      return result
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError('UNKNOWN', String(err))
      setError(apiErr)
      setLoading(false)
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { mutate, loading, error, clearError }
}
