import { api } from '@/lib/api'
import type { PetBookingDetail, VaccinationRecord } from '@/types/bpa.types'

export const checkinApi = {
  scanQr: (qrToken: string) => api.post<PetBookingDetail>('/volunteer/scan-qr', { qrToken }),

  search: (params: { q: string; campaignId?: string; sessionId?: string }) => api.get<PetBookingDetail[]>('/volunteer/search', params),

  getPetBooking: (petBookingId: string) => api.get<PetBookingDetail>(`/volunteer/pet-bookings/${petBookingId}`),

  checkIn: (petBookingId: string) => api.patch<PetBookingDetail>(`/volunteer/pet-bookings/${petBookingId}/checkin`, {}),

  vaccinate: (
    petBookingId: string,
    body: {
      services: Array<{ campaignServiceId: string; batchNumber?: string }>
      doctorId?: string
      notes?: string
    },
  ) => api.patch<PetBookingDetail>(`/volunteer/pet-bookings/${petBookingId}/vaccinate`, body),

  getVaccinationHistory: (petId: string) => api.get<{ pet: unknown; records: VaccinationRecord[] }>(`/admin/pets/${petId}/vaccination-history`),

  listVaccinationRecords: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: VaccinationRecord[]; meta: unknown }>('/admin/vaccination-records', params),
}
