import { api } from '../api'
import type { ContactSubmission, PaginatedResult, ContactStatus } from '@/types/bpa.types'

export interface ContactListParams {
  page?: number
  limit?: number
  search?: string
  status?: ContactStatus
}

export const contactsApi = {
  list: (params?: ContactListParams) =>
    api.get<PaginatedResult<ContactSubmission>>('/contacts', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) => api.get<ContactSubmission>(`/contacts/${id}`),

  updateStatus: (id: string, status: ContactStatus) => api.patch<ContactSubmission>(`/contacts/${id}/status`, { status }),
}
