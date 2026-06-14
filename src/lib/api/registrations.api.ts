import { api } from '@/lib/api'
import type { CampaignRegistration, CampaignWaitlistEntry } from '@/types/bpa.types'

export const registrationsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: CampaignRegistration[]; meta: unknown }>('/admin/campaign-registrations', params),

  getById: (id: string) =>
    api.get<CampaignRegistration>(`/admin/campaign-registrations/${id}`),

  listWaitlist: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: CampaignWaitlistEntry[]; meta: unknown }>('/admin/campaign-registrations/waitlist/list', params),

  cancelWaitlist: (id: string) =>
    api.delete<CampaignWaitlistEntry>(`/admin/campaign-registrations/waitlist/${id}`),

  confirmManualPayment: (id: string) =>
    api.post<CampaignRegistration>(`/admin/campaign-registrations/${id}/confirm-payment`, {}),

  cancel: (id: string) =>
    api.delete<CampaignRegistration>(`/admin/campaign-registrations/${id}`),
}
