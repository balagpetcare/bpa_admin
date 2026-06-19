import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import FieldOpsDashboard from './components/FieldOpsDashboard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Field Operations' }

export default async function CampaignFieldOpsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign Field Operations" />
      <FieldOpsDashboard campaignId={id} />
    </>
  )
}
