import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CampaignListContent from './components/CampaignListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaigns' }

export default function CampaignsPage() {
  return (
    <>
      <PageTItle title="Campaigns" />
      <CampaignListContent />
    </>
  )
}
