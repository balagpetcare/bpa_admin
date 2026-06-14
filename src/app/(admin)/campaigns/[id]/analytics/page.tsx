import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CampaignAnalyticsDashboard from './components/CampaignAnalyticsDashboard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Analytics' }

export default async function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign Analytics" />
      <CampaignAnalyticsDashboard campaignId={id} />
    </>
  )
}
