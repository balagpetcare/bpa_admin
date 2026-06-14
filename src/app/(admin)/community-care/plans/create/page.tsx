import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PlanForm from '../components/PlanForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Plan' }

export default function PlanCreatePage() {
  return (
    <>
      <PageTItle title="New Contribution Plan" />
      <PlanForm />
    </>
  )
}
