import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SyncLogDetailContent from '../components/SyncLogDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sync Log Detail' }

export default function SyncLogDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Sync Log Detail" />
      <SyncLogDetailContent id={params.id} />
    </>
  )
}
