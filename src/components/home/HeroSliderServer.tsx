import { listPublicHeroSlides } from '@/server/hero-slider/store'
import HeroSliderClient from './HeroSliderClient'
import HeroSliderEmptyState from './HeroSliderEmptyState'

export default async function HeroSliderServer() {
  const slides = await listPublicHeroSlides('en')

  if (slides.length === 0) {
    return <HeroSliderEmptyState />
  }

  return <HeroSliderClient slides={slides} />
}
