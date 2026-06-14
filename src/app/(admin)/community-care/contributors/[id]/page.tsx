import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ContributorDetailContent from '../components/ContributorDetailContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contributor Detail' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ContributorDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Contributor Detail" />
      <ContributorDetailContent id={id} />
    </>
  )
}
