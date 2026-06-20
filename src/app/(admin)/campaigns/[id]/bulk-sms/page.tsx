import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import BulkSmsCenter from './components/BulkSmsCenter'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Bulk SMS Center' }

export default async function BulkSmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Bulk SMS Center" />
      <BulkSmsCenter campaignId={id} />
    </>
  )
}
