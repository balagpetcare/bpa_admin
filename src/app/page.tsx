import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
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
      <section className="pet-census-home-cta">
        <div className="container-fluid pet-census-home-cta__panel">
          <div>
            <span className="pet-census-kicker">Public Module</span>
            <h2>Pet Census 2026 is now open</h2>
            <p>
              Help Bangladesh Pet Association map pet owner needs across districts for clinics, vaccinations, welfare support, and future member services.
            </p>
          </div>
          <div className="pet-census-home-cta__actions">
            <Link href="/pet-census" className="btn btn-dark btn-lg">Explore Pet Census</Link>
            <Link href="/pet-census/register" className="btn btn-outline-dark btn-lg">Register Now</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
