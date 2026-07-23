import { api } from '../api'
import type { EmailLog, EmailStatus, PaginatedResult } from '@/types/bpa.types'

export type { EmailStatus, EmailLog }

export interface EmailLogListParams {
  page?: number
  limit?: number
  search?: string
  status?: EmailStatus
  provider?: string
  dateFrom?: string
  dateTo?: string
}

export const emailLogsApi = {
  list: (params?: EmailLogListParams) =>
    api.get<PaginatedResult<EmailLog>>('/admin/email-logs', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) => api.get<EmailLog>(`/admin/email-logs/${id}`),
}
