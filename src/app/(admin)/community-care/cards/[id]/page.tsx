import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CardDetailContent from '../components/CardDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Card Detail' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Card Detail" />
      <CardDetailContent id={id} />
    </>
  )
}
