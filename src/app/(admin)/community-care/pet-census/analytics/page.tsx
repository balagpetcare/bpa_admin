import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PetCensusAnalyticsContent from '../components/PetCensusAnalyticsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pet Census Analytics' }

export default function PetCensusAnalyticsPage() {
  return (
    <>
      <PageTItle title="Pet Census Analytics" />
      <PetCensusAnalyticsContent />
    </>
  )
}
