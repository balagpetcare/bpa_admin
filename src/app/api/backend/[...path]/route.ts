import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const dynamic = 'force-dynamic'
const API_BASE = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4100/api/v1'
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function hasUnsafePathSegment(path: string[]): boolean {
  return path.some((segment) => {
    const normalized = segment.trim()
    return (
      !normalized ||
      normalized === '.' ||
      normalized === '..' ||
      normalized.includes('/') ||
      normalized.includes('\\')
    )
  })
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const origin = request.headers.get('origin')
  if (MUTATING.has(request.method) && origin !== request.nextUrl.origin) {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Cross-origin request rejected.' } }, { status: 403 })
  }
  const { path } = await context.params
  if (hasUnsafePathSegment(path)) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid backend path.' } }, { status: 400 })
  }
  const isPublic = path[0] === 'public'
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const accessToken = session?.accessToken as string | undefined
  if (!accessToken && !isPublic) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized.' } }, { status: 401 })
  const target = new URL(`${API_BASE.replace(/\/$/, '')}/${path.join('/')}`)
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value))
  const headers = new Headers(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  try {
    const upstream = await fetch(target, { method: request.method, headers, body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(), cache: 'no-store', redirect: 'manual' })
    return new NextResponse(upstream.body, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' } })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Backend unavailable.' } }, { status: 502 })
  }
}
export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
