import { api } from '../api'
import type { CardVerificationLog, PaginationQuery } from '@/types/bpa.types'

export const cardVerificationLogsApi = {
  list: (params?: PaginationQuery & { cardId?: string; scanResult?: string }) =>
    api.getPaginated<CardVerificationLog>('/admin/card-verification-logs', params),
  getById: (id: string) =>
    api.get<CardVerificationLog>(`/admin/card-verification-logs/${id}`),
}
