import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CheckInDashboard from './components/CheckInDashboard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Check-In' }

export default async function CampaignCheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Check-In" />
      <CheckInDashboard campaignId={id} />
    </>
  )
}
