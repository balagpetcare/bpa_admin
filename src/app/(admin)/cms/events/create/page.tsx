import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import EventForm from '../components/EventForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Create Event' }

export default function EventCreatePage() {
  return (
    <>
      <PageTItle title="New Event" />
      <EventForm />
    </>
  )
}
