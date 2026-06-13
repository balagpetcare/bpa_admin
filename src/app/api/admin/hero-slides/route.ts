import { NextRequest } from 'next/server'
import { fail, ok } from '@/server/api-response'
import { formatValidationErrors, validateHeroSlideInput } from '@/server/hero-slider/schema'
import { createHeroSlide, listHeroSlides } from '@/server/hero-slider/store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') ?? '20')))
  const status = searchParams.get('status') as 'draft' | 'published' | 'archived' | ''
  const locale = searchParams.get('locale')
  const search = searchParams.get('search')

  const all = await listHeroSlides({
    includeArchived: true,
    locale,
    search,
    status,
  })

  const start = (page - 1) * limit
  const end = start + limit
  const data = all.slice(start, end)
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return ok(data, {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  })
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json()
    const validated = await validateHeroSlideInput(input)
    const created = await createHeroSlide(validated)
    return ok(created)
  } catch (error) {
    return fail('VALIDATION_ERROR', 'Invalid hero slide payload.', 400, formatValidationErrors(error))
  }
}
