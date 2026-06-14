import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import RoadmapItemEditContent from '../components/RoadmapItemEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Roadmap Item' }

type PageProps = { params: Promise<{ id: string }> }

export default async function RoadmapItemEditPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Roadmap Item" />
      <RoadmapItemEditContent id={id} />
    </>
  )
}
