import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CardListContent from './components/CardListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Care Partner Cards' }

export default function CardsPage() {
  return (
    <>
      <PageTItle title="Care Partner Cards" />
      <CardListContent />
    </>
  )
}
