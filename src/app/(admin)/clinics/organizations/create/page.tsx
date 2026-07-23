import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicOrganizationCreateContent from './components/ClinicOrganizationCreateContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Clinic Organization' }

export default function ClinicOrganizationCreatePage() {
  return (
    <>
      <PageTItle title="New Clinic Organization" />
      <ClinicOrganizationCreateContent />
    </>
  )
}
