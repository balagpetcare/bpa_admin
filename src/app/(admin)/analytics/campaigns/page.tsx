import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import GlobalCampaignAnalyticsDashboard from './components/GlobalCampaignAnalyticsDashboard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Global Campaign Analytics' }

export default function GlobalCampaignAnalyticsPage() {
  return (
    <>
      <PageTItle title="Global Campaign Analytics" />
      <GlobalCampaignAnalyticsDashboard />
    </>
  )
}
