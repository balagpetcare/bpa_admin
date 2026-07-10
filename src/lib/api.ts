import { getSession, signOut } from 'next-auth/react'
import type { ApiResponse, ApiErrorResponse } from '@/types/bpa.types'
import { getApiBase } from '@/lib/utils/api-url'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown[],
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE_URL = getApiBase()

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    // Dynamic imports keep these server-only modules out of the client bundle.
    // options.ts has a module-level throw when BACKEND_API_URL is absent; in the
    // browser that env var is always undefined (no NEXT_PUBLIC_ prefix), so a
    // static import would crash the client on every page load in production.
    const { getServerSession } = await import('next-auth/next')
    const { options: authOptions } = await import('@/app/api/auth/[...nextauth]/options')
    const session = await getServerSession(authOptions)
    return session?.accessToken ?? null
  }
  const session = await getSession()
  return session?.accessToken ?? null
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  isMultipart?: boolean
}

export async function apiClient<T = unknown>(
  endpoint: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { body, params, isMultipart, headers: extraHeaders, ...fetchOpts } = opts

  // Build URL with query params
  const url = new URL(`${BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const token = await getAccessToken()

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  }

  if (!isMultipart && body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url.toString(), {
    ...fetchOpts,
    headers,
    body: isMultipart ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    signal: fetchOpts.signal ?? AbortSignal.timeout(15000),
  })

  // 401: token probably expired and refresh failed — force sign-out client-side
  if (res.status === 401 && typeof window !== 'undefined') {
    await signOut({ redirect: true, callbackUrl: '/auth/sign-in' })
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign in again.', [], 401)
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  const json: ApiResponse<T> = await res.json()

  if (!json.success) {
    const err = (json as ApiErrorResponse).error
    const code = err?.code ?? 'UNKNOWN'
    const message = err?.message ?? 'An unexpected error occurred'
    throw new ApiError(code, message, err?.details as unknown[] | undefined, res.status)
  }

  return json.data as T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export async function apiClientPaginated<T = unknown>(
  endpoint: string,
  opts: RequestOptions = {},
): Promise<PaginatedResponse<T>> {
  const { body, params, isMultipart, headers: extraHeaders, ...fetchOpts } = opts

  const url = new URL(`${BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const token = await getAccessToken()

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  }

  if (!isMultipart && body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url.toString(), {
    ...fetchOpts,
    headers,
    body: isMultipart ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    signal: fetchOpts.signal ?? AbortSignal.timeout(15000),
  })

  if (res.status === 401 && typeof window !== 'undefined') {
    await signOut({ redirect: true, callbackUrl: '/auth/sign-in' })
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign in again.', [], 401)
  }

  const json = await res.json()

  if (!json.success) {
    const err = (json as ApiErrorResponse).error
    const code = err?.code ?? 'UNKNOWN'
    const message = err?.message ?? 'An unexpected error occurred'
    throw new ApiError(code, message, err?.details as unknown[] | undefined, res.status)
  }

  const rawMeta = json.meta ?? {}
  const page: number = rawMeta.page ?? 1
  const totalPages: number = rawMeta.totalPages ?? 1

  return {
    data: json.data as T[],
    meta: {
      page,
      limit: rawMeta.limit ?? 20,
      total: rawMeta.total ?? 0,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// Convenience wrappers
export const api = {
  get: <T>(endpoint: string, params?: RequestOptions['params']) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  getPaginated: <T>(endpoint: string, params?: RequestOptions['params']) =>
    apiClientPaginated<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData) =>
    apiClient<T>(endpoint, { method: 'POST', body: formData, isMultipart: true }),
}
