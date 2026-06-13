import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import EmailLogsContent from './components/EmailLogsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Email Logs' }

export default function EmailLogsPage() {
  return (
    <>
      <PageTItle title="Email Logs" />
      <EmailLogsContent />
    </>
  )
}
