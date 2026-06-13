import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SyncLogListContent from './components/SyncLogListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'PSS Sync Logs' }

export default function SyncLogsPage() {
  return (
    <>
      <PageTItle title="PSS Sync Logs" />
      <SyncLogListContent />
    </>
  )
}
