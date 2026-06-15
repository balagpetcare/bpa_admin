import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CardListContent from './components/CardListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Care Partner Cards' }

export default function CardsPage() {
  return (
    <>
      <PageTItle title="Care Partner Cards (Legacy)" />
      <div className="alert alert-info mb-3 d-flex align-items-center gap-2" role="alert">
        <span>ℹ️</span>
        <span className="small">
          This section manages legacy Care Partner Cards. New purchases are issued as BPA Community Care Partner Cards.
        </span>
      </div>
      <CardListContent />
    </>
  )
}
