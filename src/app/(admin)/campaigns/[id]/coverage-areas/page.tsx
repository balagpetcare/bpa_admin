import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CoverageAreasManager from './components/CoverageAreasManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Coverage Areas' }

export default async function CampaignCoverageAreasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Coverage Areas" />
      <CoverageAreasManager campaignId={id} />
    </>
  )
}
