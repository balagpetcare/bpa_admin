import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CardDetailContent from '../components/CardDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Card Detail' }

export default function CardDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Card Detail" />
      <CardDetailContent id={params.id} />
    </>
  )
}
