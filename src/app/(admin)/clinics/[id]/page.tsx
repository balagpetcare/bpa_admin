import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicBranchDetailContent from './components/ClinicBranchDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Clinic Branch' }

export default async function ClinicBranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Clinic Branch" />
      <ClinicBranchDetailContent id={id} />
    </>
  )
}
