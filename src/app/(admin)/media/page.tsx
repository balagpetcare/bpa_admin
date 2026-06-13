import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import MediaPageContent from './components/MediaPageContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Media Library' }

export default function MediaPage() {
  return (
    <>
      <PageTItle title="Media Library" />
      <MediaPageContent />
    </>
  )
}
