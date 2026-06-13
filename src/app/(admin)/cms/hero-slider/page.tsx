import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import HeroSliderListContent from './components/HeroSliderListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Hero Slider CMS' }

export default function HeroSliderPage() {
  return (
    <>
      <PageTItle title="Hero Slider CMS" />
      <HeroSliderListContent />
    </>
  )
}
