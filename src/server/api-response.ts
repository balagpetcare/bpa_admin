import { NextResponse } from 'next/server'
import type { PaginationMeta } from '@/types/bpa.types'

export function ok<T>(data: T, meta?: PaginationMeta) {
  return NextResponse.json({ success: true, data, meta })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function fail(code: string, message: string, status = 400, details?: unknown[]) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  )
}
