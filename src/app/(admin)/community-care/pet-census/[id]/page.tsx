import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PetCensusDetailContent from '../components/PetCensusDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Census Submission' }

export default function PetCensusDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Census Submission" />
      <PetCensusDetailContent id={params.id} />
    </>
  )
}
