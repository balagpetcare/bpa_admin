import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicOrganizationEditContent from './components/ClinicOrganizationEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Clinic Organization' }

export default async function ClinicOrganizationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Clinic Organization" />
      <ClinicOrganizationEditContent id={id} />
    </>
  )
}
