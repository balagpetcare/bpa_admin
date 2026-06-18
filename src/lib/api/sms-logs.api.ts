import { api } from '../api'
import type { SmsLog, SmsStatus, PaginatedResult } from '@/types/bpa.types'

export type { SmsStatus, SmsLog }

export interface SmsLogListParams {
  page?: number
  limit?: number
  search?: string
  status?: SmsStatus
  provider?: string
  module?: string
  messageType?: string
  failureReason?: string
  reference?: string
  recipient?: string
  isOtp?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface SmsStats {
  total: number
  sent: number
  failed: number
  queued: number
  sending: number
  failedLast24h: number
  insufficientBalanceCount: number
  gatewayTimeoutCount: number
  possibleGatewayIssue: boolean
  recentFailuresLast60min: number
  byModule: Array<{ module: string; count: number }>
  byStatus: Array<{ status: SmsStatus; count: number }>
}

export interface ResendResult {
  smsLogId: string
  status: SmsStatus
  skipped: boolean
  skipReason?: string
}

export interface RetryFailedParams {
  module?: string
  messageType?: string
  failureReason?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  force?: boolean
}

export interface RetryFailedResult {
  attempted: number
  sent: number
  failed: number
  skipped: number
  skippedOtp: number
  skippedMaxAttempts: number
}

export const smsLogsApi = {
  list: (params?: SmsLogListParams) =>
    api.get<PaginatedResult<SmsLog>>(
      '/admin/sms-logs',
      params as Record<string, string | number | boolean | undefined>,
    ),

  getById: (id: string) => api.get<SmsLog>(`/admin/sms-logs/${id}`),

  getStats: () => api.get<SmsStats>('/admin/sms-logs/stats'),

  resend: (id: string, opts?: { force?: boolean }) =>
    api.post<ResendResult>(`/admin/sms-logs/${id}/resend`, opts ?? {}),

  retryFailed: (params?: RetryFailedParams) =>
    api.post<RetryFailedResult>('/admin/sms-logs/retry-failed', params ?? {}),
}
