import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ParticipantsList from './components/ParticipantsList'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Participants & Payments' }

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Participants & Payments" />
      <ParticipantsList campaignId={id} />
    </>
  )
}
