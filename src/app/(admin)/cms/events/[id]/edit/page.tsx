import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import EventEditContent from './EventEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Event' }

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Event" />
      <EventEditContent id={id} />
    </>
  )
}
