import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PlanListContent from './components/PlanListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contribution Plans' }

export default function PlansPage() {
  return (
    <>
      <PageTItle title="Contribution Plans" />
      <PlanListContent />
    </>
  )
}
