import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import RoadmapItemForm from '../components/RoadmapItemForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Roadmap Item' }

export default function RoadmapItemCreatePage() {
  return (
    <>
      <PageTItle title="New Roadmap Item" />
      <RoadmapItemForm />
    </>
  )
}
