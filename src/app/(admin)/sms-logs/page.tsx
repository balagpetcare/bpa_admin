import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SmsLogsContent from './components/SmsLogsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'SMS Logs' }

export default function SmsLogsPage() {
  return (
    <>
      <PageTItle title="SMS Logs" />
      <SmsLogsContent />
    </>
  )
}
