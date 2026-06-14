import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SyncLogDetailContent from '../components/SyncLogDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sync Log Detail' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function SyncLogDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Sync Log Detail" />
      <SyncLogDetailContent id={id} />
    </>
  )
}
