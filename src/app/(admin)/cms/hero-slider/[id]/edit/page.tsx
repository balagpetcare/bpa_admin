import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import HeroSliderEditContent from '../../components/HeroSliderEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Hero Slide' }

export default async function HeroSliderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Edit Hero Slide" />
      <HeroSliderEditContent id={id} />
    </>
  )
}
