import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import StaffAssignment from './components/StaffAssignment'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Staff & Volunteer Assignments' }

export default async function CampaignStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Staff & Volunteer Assignments" />
      <StaffAssignment campaignId={id} />
    </>
  )
}
