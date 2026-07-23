import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicOrganizationListContent from './components/ClinicOrganizationListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Clinic Organizations' }

export default function ClinicOrganizationsPage() {
  return (
    <>
      <PageTItle title="Clinic Organizations" />
      <ClinicOrganizationListContent />
    </>
  )
}
