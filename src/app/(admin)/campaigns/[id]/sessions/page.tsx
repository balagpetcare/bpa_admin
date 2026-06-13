import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SessionsManager from './components/SessionsManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Sessions' }

export default async function SessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign Sessions" />
      <SessionsManager campaignId={id} />
    </>
  )
}
