import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import DiagnosticServiceListContent from './components/DiagnosticServiceListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Diagnostic Center Services' }

export default function DiagnosticCenterServicesPage() {
  return (
    <>
      <PageTItle title="Diagnostic Center Services" />
      <DiagnosticServiceListContent />
    </>
  )
}
