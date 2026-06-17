import { api } from '../api'
import type { CardVerificationLog, PaginationQuery } from '@/types/bpa.types'

export const cardVerificationLogsApi = {
  list: (params?: PaginationQuery & { cardId?: string; scanResult?: string }) =>
    api.getPaginated<CardVerificationLog>('/admin/care-partner-cards/verification-logs', params),
  getById: (id: string) =>
    api.get<CardVerificationLog>(`/admin/care-partner-cards/verification-logs/${id}`),
}
