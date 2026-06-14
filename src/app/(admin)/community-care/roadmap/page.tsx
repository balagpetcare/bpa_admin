import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import RoadmapItemListContent from './components/RoadmapItemListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Future Roadmap' }

export default function RoadmapPage() {
  return (
    <>
      <PageTItle title="Future Roadmap" />
      <RoadmapItemListContent />
    </>
  )
}
