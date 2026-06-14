import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import QrScanLogsView from './components/QrScanLogsView'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'QR Scan Logs' }

export default async function QrScanLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="QR Scan Logs" />
      <QrScanLogsView campaignId={id} />
    </>
  )
}
