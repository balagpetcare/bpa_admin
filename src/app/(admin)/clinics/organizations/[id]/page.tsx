import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicOrganizationDetailContent from './components/ClinicOrganizationDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Clinic Organization' }

export default async function ClinicOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Clinic Organization" />
      <ClinicOrganizationDetailContent id={id} />
    </>
  )
}
