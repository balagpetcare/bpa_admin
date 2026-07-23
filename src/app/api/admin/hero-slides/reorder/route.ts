import { NextRequest } from 'next/server'
import { fail, ok } from '@/server/api-response'
import { reorderHeroSlides } from '@/server/hero-slider/store'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids?: string[] }
    if (!Array.isArray(body.ids)) {
      return fail('VALIDATION_ERROR', 'The "ids" field must be an array.', 400)
    }

    const reordered = await reorderHeroSlides(body.ids)
    return ok(reordered)
  } catch (error) {
    return fail('UNKNOWN', error instanceof Error ? error.message : 'Failed to reorder slides.', 500)
  }
}
