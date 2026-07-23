import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicBranchCreateContent from './components/ClinicBranchCreateContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Clinic Branch' }

export default function ClinicBranchCreatePage() {
  return (
    <>
      <PageTItle title="New Clinic Branch" />
      <ClinicBranchCreateContent />
    </>
  )
}
