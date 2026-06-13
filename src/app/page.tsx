import { Suspense } from 'react'
import type { Metadata } from 'next'
import HeroSliderServer from '@/components/home/HeroSliderServer'
import HeroSliderSkeleton from '@/components/home/HeroSliderSkeleton'
import { listPublicHeroSlides } from '@/server/hero-slider/store'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const slides = await listPublicHeroSlides('en')
  const first = slides[0]

  return {
    title: first?.headline ?? 'BPA Homepage',
    description: first?.body ?? 'BPA community programs, campaigns, and services.',
  }
}

export default function HomePage() {
  return (
    <main className="landing-homepage">
      <Suspense fallback={<HeroSliderSkeleton />}>
        <HeroSliderServer />
      </Suspense>
    </main>
  )
}
