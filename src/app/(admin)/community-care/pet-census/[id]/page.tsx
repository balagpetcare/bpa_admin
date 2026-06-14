import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PetCensusDetailContent from '../components/PetCensusDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Census Submission' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PetCensusDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Census Submission" />
      <PetCensusDetailContent id={id} />
    </>
  )
}
