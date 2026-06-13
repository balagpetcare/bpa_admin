import { NextRequest } from 'next/server'
import { fail, ok } from '@/server/api-response'
import { formatValidationErrors, validateHeroSlideInput } from '@/server/hero-slider/schema'
import { deleteHeroSlide, getHeroSlideById, updateHeroSlide } from '@/server/hero-slider/store'

export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slide = await getHeroSlideById(id)
  if (!slide) return fail('NOT_FOUND', 'Hero slide not found.', 404)
  return ok(slide)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const input = await request.json()
    const validated = await validateHeroSlideInput(input)
    const updated = await updateHeroSlide(id, validated)
    if (!updated) return fail('NOT_FOUND', 'Hero slide not found.', 404)
    return ok(updated)
  } catch (error) {
    return fail('VALIDATION_ERROR', 'Invalid hero slide payload.', 400, formatValidationErrors(error))
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await deleteHeroSlide(id)
  if (!deleted) return fail('NOT_FOUND', 'Hero slide not found.', 404)
  return ok({ id })
}
