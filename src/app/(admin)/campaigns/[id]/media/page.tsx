import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CampaignMediaManager from './components/CampaignMediaManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Media' }

export default async function CampaignMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign Media" />
      <div className="container-fluid">
        <CampaignMediaManager campaignId={id} />
      </div>
    </>
  )
}
