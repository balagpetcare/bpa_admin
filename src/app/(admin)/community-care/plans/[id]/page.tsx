import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PlanEditContent from '../components/PlanEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Plan' }

export default function PlanEditPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Edit Plan" />
      <PlanEditContent id={params.id} />
    </>
  )
}
