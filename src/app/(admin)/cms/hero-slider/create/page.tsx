import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import HeroSliderForm from '../components/HeroSliderForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Create Hero Slide' }

export default function HeroSliderCreatePage() {
  return (
    <>
      <PageTItle title="New Hero Slide" />
      <HeroSliderForm />
    </>
  )
}
