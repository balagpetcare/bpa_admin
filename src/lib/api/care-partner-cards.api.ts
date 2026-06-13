import { api } from '../api'
import type { CarePartnerCard, PaginationQuery } from '@/types/bpa.types'

export const carePartnerCardsApi = {
  list: (params?: PaginationQuery & { status?: string; zoneId?: string }) =>
    api.getPaginated<CarePartnerCard>('/admin/care-partner-cards', params),
  getById: (id: string) => api.get<CarePartnerCard>(`/admin/care-partner-cards/${id}`),
  revoke: (id: string, reason: string) =>
    api.patch<CarePartnerCard>(`/admin/care-partner-cards/${id}/revoke`, { reason }),
  reactivate: (id: string) =>
    api.patch<CarePartnerCard>(`/admin/care-partner-cards/${id}/reactivate`, {}),
}
