import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import NewsEditContent from './NewsEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Article' }

export default async function NewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Article" />
      <NewsEditContent id={id} />
    </>
  )
}
