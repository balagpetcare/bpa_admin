import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicBranchEditContent from './components/ClinicBranchEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Clinic Branch' }

export default async function ClinicBranchEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Clinic Branch" />
      <ClinicBranchEditContent id={id} />
    </>
  )
}
