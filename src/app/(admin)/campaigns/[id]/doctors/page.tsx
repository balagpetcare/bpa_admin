import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import DoctorsAssignment from './components/DoctorsAssignment'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Doctors' }

export default async function CampaignDoctorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Doctor Assignment" />
      <DoctorsAssignment campaignId={id} />
    </>
  )
}
