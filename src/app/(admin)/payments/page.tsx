import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PaymentsContent from './components/PaymentsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Payments' }

export default function PaymentsPage() {
  return (
    <>
      <PageTItle title="Payments" />
      <PaymentsContent />
    </>
  )
}
