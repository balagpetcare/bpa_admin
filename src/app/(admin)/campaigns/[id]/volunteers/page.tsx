import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import VolunteersAssignment from './components/VolunteersAssignment'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Volunteers' }

export default async function CampaignVolunteersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Volunteer Assignment" />
      <VolunteersAssignment campaignId={id} />
    </>
  )
}
