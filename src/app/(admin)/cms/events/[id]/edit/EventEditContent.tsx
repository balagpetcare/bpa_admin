'use client'

import { useApi } from '@/hooks/useApi'
import { eventsApi } from '@/lib/api/events.api'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import EventForm from '../../components/EventForm'
import type { ApiError } from '@/lib/api'

export default function EventEditContent({ id }: { id: string }) {
  const { data, loading, error } = useApi(() => eventsApi.getById(id), [id])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
  if (error) return <ApiErrorAlert error={error as ApiError} />
  if (!data) return <EmptyState title="Event not found" />

  return <EventForm existing={data} />
}
