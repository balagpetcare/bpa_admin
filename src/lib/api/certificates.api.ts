import { api } from '@/lib/api'
import type { Certificate } from '@/types/bpa.types'

interface PagedResult<T> { items: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }

export const certificatesApi = {
  issue: (petBookingId: string) =>
    api.post<Certificate>('/admin/certificates/issue', { petBookingId }),

  reissue: (petBookingId: string) =>
    api.patch<Certificate>(`/admin/pet-bookings/${petBookingId}/certificates/reissue`, {}),

  getByPetBooking: (petBookingId: string) =>
    api.get<Certificate>(`/admin/pet-bookings/${petBookingId}/certificate`),

  list: (params: { campaignId?: string; page?: number; limit?: number }) =>
    api.get<PagedResult<Certificate>>('/admin/certificates', params),

  verifyByCertNumber: (certNumber: string) =>
    api.get<{ valid: boolean; certificate?: Certificate; message?: string }>(`/admin/certificates/${certNumber}/verify`),

  getHtmlUrl: (verifyToken: string) =>
    `/api/v1/public/campaigns/certificate-html/${verifyToken}`,
}
