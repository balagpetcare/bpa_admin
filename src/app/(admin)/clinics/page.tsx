import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicBranchListContent from './components/ClinicBranchListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Clinics & Branches' }

export default function ClinicsPage() {
  return (
    <>
      <PageTItle title="Clinics & Branches" />
      <ClinicBranchListContent />
    </>
  )
}
