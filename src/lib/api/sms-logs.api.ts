import { api } from '../api'
import type { SmsLog, SmsStatus, PaginatedResult } from '@/types/bpa.types'

export type { SmsStatus, SmsLog }

export interface SmsLogListParams {
  page?: number
  limit?: number
  search?: string
  status?: SmsStatus
  provider?: string
  dateFrom?: string
  dateTo?: string
}

export const smsLogsApi = {
  list: (params?: SmsLogListParams) =>
    api.get<PaginatedResult<SmsLog>>(
      '/admin/sms-logs',
      params as Record<string, string | number | boolean | undefined>,
    ),

  getById: (id: string) => api.get<SmsLog>(`/admin/sms-logs/${id}`),
}
