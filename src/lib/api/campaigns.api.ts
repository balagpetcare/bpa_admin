import { api } from '../api'
import type {
  CampaignListItem, CampaignDetail, CampaignSession, CampaignService,
  CampaignDoctor, CampaignVolunteer, CampaignType, CampaignStatus,
  CampaignMedia, CampaignMediaRole,
} from '@/types/bpa.types'

export interface CampaignListParams {
  page?: number; limit?: number; search?: string; status?: CampaignStatus; campaignType?: CampaignType
}

export interface CreateCampaignDto {
  title: string; description?: string; campaignType: CampaignType
  startDate: string; endDate: string; registrationOpenAt?: string; registrationCloseAt?: string
  basePriceBdt: number; maxPetsPerBooking?: number
  certificateTemplateId?: string; coverImageId?: string
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface CreateSessionDto {
  venueId: string; sessionDate: string; startTime: string; endTime: string
  capacity: number; notes?: string
}

export interface CreateServiceDto {
  name: string; description?: string; priceOverrideBdt?: number; sortOrder?: number; vaccineCatalogId?: string
}

export const campaignsApi = {
  // Campaigns
  list: (params?: CampaignListParams) =>
    api.getPaginated<CampaignListItem>(
      '/admin/campaigns',
      params as Record<string, string | number | boolean | undefined>,
    ),
  getById: (id: string) => api.get<CampaignDetail>(`/admin/campaigns/${id}`),
  create: (dto: CreateCampaignDto) => api.post<CampaignListItem>('/admin/campaigns', dto),
  update: (id: string, dto: UpdateCampaignDto) => api.patch<CampaignListItem>(`/admin/campaigns/${id}`, dto),
  remove: (id: string) => api.delete<void>(`/admin/campaigns/${id}`),

  // Lifecycle
  publish: (id: string) => api.patch<CampaignListItem>(`/admin/campaigns/${id}/publish`, {}),
  openRegistration: (id: string) => api.patch<CampaignListItem>(`/admin/campaigns/${id}/open-registration`, {}),
  closeRegistration: (id: string) => api.patch<CampaignListItem>(`/admin/campaigns/${id}/close-registration`, {}),
  complete: (id: string) => api.patch<CampaignListItem>(`/admin/campaigns/${id}/complete`, {}),
  cancel: (id: string) => api.patch<CampaignListItem>(`/admin/campaigns/${id}/cancel`, {}),

  // Sessions
  listSessions: (campaignId: string) => api.get<CampaignSession[]>(`/admin/campaigns/${campaignId}/sessions`),
  createSession: (campaignId: string, dto: CreateSessionDto) =>
    api.post<CampaignSession>(`/admin/campaigns/${campaignId}/sessions`, dto),
  updateSession: (campaignId: string, sessionId: string, dto: Partial<CreateSessionDto>) =>
    api.patch<CampaignSession>(`/admin/campaigns/${campaignId}/sessions/${sessionId}`, dto),
  deleteSession: (campaignId: string, sessionId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/sessions/${sessionId}`),

  // Services
  listServices: (campaignId: string) => api.get<CampaignService[]>(`/admin/campaigns/${campaignId}/services`),
  createService: (campaignId: string, dto: CreateServiceDto) =>
    api.post<CampaignService>(`/admin/campaigns/${campaignId}/services`, dto),
  updateService: (campaignId: string, serviceId: string, dto: Partial<CreateServiceDto>) =>
    api.patch<CampaignService>(`/admin/campaigns/${campaignId}/services/${serviceId}`, dto),
  deleteService: (campaignId: string, serviceId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/services/${serviceId}`),

  // Doctor Assignment
  listDoctors: (campaignId: string) => api.get<CampaignDoctor[]>(`/admin/campaigns/${campaignId}/doctors`),
  assignDoctor: (campaignId: string, dto: { doctorId: string; sessionId?: string }) =>
    api.post<CampaignDoctor>(`/admin/campaigns/${campaignId}/doctors`, dto),
  removeDoctor: (campaignId: string, doctorId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/doctors/${doctorId}`),

  // Volunteer Assignment
  listVolunteers: (campaignId: string) => api.get<CampaignVolunteer[]>(`/admin/campaigns/${campaignId}/volunteers`),
  assignVolunteer: (campaignId: string, dto: { userId: string; sessionId?: string }) =>
    api.post<CampaignVolunteer>(`/admin/campaigns/${campaignId}/volunteers`, dto),
  removeVolunteer: (campaignId: string, userId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/volunteers/${userId}`),

  // Media
  listMedia: (campaignId: string) => api.get<CampaignMedia[]>(`/admin/campaigns/${campaignId}/media`),
  uploadMedia: (campaignId: string, file: File, role: CampaignMediaRole, altText?: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('role', role)
    if (altText) form.append('altText', altText)
    return api.upload<CampaignMedia>(`/admin/campaigns/${campaignId}/media/upload`, form)
  },
  updateMedia: (campaignId: string, mediaId: string, dto: { altText?: string | null; sortOrder?: number }) =>
    api.patch<CampaignMedia>(`/admin/campaigns/${campaignId}/media/${mediaId}`, dto),
  deleteMedia: (campaignId: string, mediaId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/media/${mediaId}`),
  reorderMedia: (campaignId: string, ids: string[]) =>
    api.patch<CampaignMedia[]>(`/admin/campaigns/${campaignId}/media/reorder`, { ids }),
}
