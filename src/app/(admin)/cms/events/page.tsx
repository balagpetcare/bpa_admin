import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import EventsListContent from './components/EventsListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Event CMS' }

export default function EventsPage() {
  return (
    <>
      <PageTItle title="Event CMS" />
      <EventsListContent />
    </>
  )
}
