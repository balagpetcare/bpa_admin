import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import RegistrationsList from './components/RegistrationsList'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Registrations' }

export default async function CampaignRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Registrations" />
      <RegistrationsList campaignId={id} />
    </>
  )
}
