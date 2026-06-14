import { NextRequest } from 'next/server'
import { ok } from '@/server/api-response'
import { listPublicHeroSlides } from '@/server/hero-slider/store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale')
  const slides = await listPublicHeroSlides(locale)
  return ok(slides)
}
