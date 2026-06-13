import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import VerificationLogListContent from './components/VerificationLogListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Card Verification Logs' }

export default function VerificationLogsPage() {
  return (
    <>
      <PageTItle title="Card Verification Logs" />
      <VerificationLogListContent />
    </>
  )
}
