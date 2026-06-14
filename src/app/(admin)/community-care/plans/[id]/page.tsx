import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PlanEditContent from '../components/PlanEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Plan' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PlanEditPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Edit Plan" />
      <PlanEditContent id={id} />
    </>
  )
}
