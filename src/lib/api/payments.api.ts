import { api } from '../api'
import type { Payment, PaymentStatus, PaymentGateway, PaginatedResult } from '@/types/bpa.types'

export type { PaymentStatus, PaymentGateway, Payment }

export interface PaymentListParams {
  page?: number
  limit?: number
  status?: PaymentStatus
  gateway?: PaymentGateway
  search?: string
}

export const paymentsApi = {
  list: (params?: PaymentListParams) =>
    api.get<PaginatedResult<Payment>>('/admin/payments', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) => api.get<Payment>(`/admin/payments/${id}`),

  sync: (id: string) => api.post<{ id: string; status: PaymentStatus }>(`/admin/payments/${id}/sync`, {}),
}
