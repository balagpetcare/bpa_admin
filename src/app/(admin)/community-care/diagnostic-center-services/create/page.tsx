import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import DiagnosticServiceForm from '../components/DiagnosticServiceForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Diagnostic Center Service' }

export default function DiagnosticServiceCreatePage() {
  return (
    <>
      <PageTItle title="New Diagnostic Center Service" />
      <DiagnosticServiceForm />
    </>
  )
}
