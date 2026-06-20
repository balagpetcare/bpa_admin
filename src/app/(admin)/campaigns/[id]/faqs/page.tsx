import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import FaqsManager from './components/FaqsManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign FAQs' }

export default async function FaqsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign FAQs" />
      <FaqsManager campaignId={id} />
    </>
  )
}
