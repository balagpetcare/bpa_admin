import { api } from '../api'
import type { EventListItem, EventRegistration, PaginatedResult, EventStatus, RegistrationStatus } from '@/types/bpa.types'

export interface EventListParams {
  page?: number
  limit?: number
  search?: string
  status?: EventStatus
  upcoming?: boolean
}

export interface CreateEventDto {
  title: string
  slug?: string
  description?: string
  coverImageId?: string | null
  location?: string | null
  startsAt: string
  endsAt?: string | null
  capacity?: number | null
  isPaid?: boolean
  fee?: number | null
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface RegistrationListParams {
  page?: number
  limit?: number
  status?: RegistrationStatus
}

export const eventsApi = {
  list: (params?: EventListParams) =>
    api.get<PaginatedResult<EventListItem>>('/events', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) => api.get<EventListItem>(`/events/${id}`),

  create: (dto: CreateEventDto) => api.post<EventListItem>('/events', dto),

  update: (id: string, dto: UpdateEventDto) => api.put<EventListItem>(`/events/${id}`, dto),

  publish: (id: string, dto: { status: EventStatus }) =>
    api.patch<EventListItem>(`/events/${id}/publish`, dto),

  remove: (id: string) => api.delete<void>(`/events/${id}`),

  listRegistrations: (id: string, params?: RegistrationListParams) =>
    api.get<PaginatedResult<EventRegistration>>(
      `/events/${id}/registrations`,
      params as Record<string, string | number | boolean | undefined>,
    ),

  updateRegistrationStatus: (eventId: string, regId: string, status: RegistrationStatus) =>
    api.patch<EventRegistration>(`/events/${eventId}/registrations/${regId}/status`, { status }),
}
