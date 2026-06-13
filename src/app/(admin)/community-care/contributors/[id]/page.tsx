import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ContributorDetailContent from '../components/ContributorDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contributor Detail' }

export default function ContributorDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Contributor Detail" />
      <ContributorDetailContent id={params.id} />
    </>
  )
}
