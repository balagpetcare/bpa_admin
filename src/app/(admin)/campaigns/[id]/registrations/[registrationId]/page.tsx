import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import RegistrationDetail from './components/RegistrationDetail'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Registration Detail' }

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string; registrationId: string }> }) {
  const { id, registrationId } = await params
  return (
    <>
      <PageTItle title="Registration Detail" />
      <RegistrationDetail campaignId={id} registrationId={registrationId} />
    </>
  )
}
