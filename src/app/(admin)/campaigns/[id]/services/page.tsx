import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ServicesManager from './components/ServicesManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Services' }

export default async function ServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Campaign Services" />
      <ServicesManager campaignId={id} />
    </>
  )
}
