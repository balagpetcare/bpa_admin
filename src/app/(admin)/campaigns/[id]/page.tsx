import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CampaignDetailContent from './components/CampaignDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Detail' }

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign Detail" />
      <CampaignDetailContent campaignId={id} />
    </>
  )
}
