import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ExportCenter from './components/ExportCenter'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Export Center' }

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Export Center" />
      <ExportCenter campaignId={id} />
    </>
  )
}
