import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import WaitlistManager from './components/WaitlistManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Waitlist' }

export default async function CampaignWaitlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Waitlist" />
      <WaitlistManager campaignId={id} />
    </>
  )
}
