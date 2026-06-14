import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import DiagnosticServiceEditContent from '../components/DiagnosticServiceEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Diagnostic Center Service' }

type PageProps = { params: Promise<{ id: string }> }

export default async function DiagnosticServiceEditPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Diagnostic Center Service" />
      <DiagnosticServiceEditContent id={id} />
    </>
  )
}
