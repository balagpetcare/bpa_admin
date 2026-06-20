import { api } from '../api'
import type {
  CampaignListItem, CampaignDetail, CampaignSession, CampaignService,
  CampaignDoctor, CampaignVolunteer, CampaignType, CampaignStatus,
  CampaignMedia, CampaignMediaRole, Doctor,
  StaffDutyRole, DoctorDutyRole,
  CampaignStaffAssignment,
  QRVerifyResult, FieldOpsStats, QRScanLogEntry,
  VaccinationCompleteResult, CertificateIssueResult,
  CampaignFaq,
} from '@/types/bpa.types'

export interface CampaignListParams {
  page?: number; limit?: number; search?: string; status?: CampaignStatus; campaignType?: CampaignType
}

export interface CreateCampaignDto {
  title: string; slug?: string; description?: string; campaignType: CampaignType
  startDate: string; endDate: string; registrationOpenAt?: string; registrationCloseAt?: string
  basePriceBdt: number; maxPetsPerBooking?: number
  certificateTemplateId?: string; coverImageId?: string; allowedPetTypes?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface CreateSessionDto {
  venueId: string; sessionDate: string; startTime: string; endTime: string
  capacity: number; notes?: string
}

export interface CreateServiceDto {
  name: string; description?: string; sortOrder?: number; vaccineCatalogId?: string; priceBdt?: number
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
  reopen: (id: string) => api.patch<CampaignListItem>(`/admin/campaigns/${id}/reopen`, {}),

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

  // Doctor Assignment (updated with duty roles)
  listDoctors: (campaignId: string, sessionId?: string) =>
    api.get<CampaignDoctor[]>(`/admin/campaigns/${campaignId}/doctors${sessionId ? `?sessionId=${sessionId}` : ''}`),
  assignDoctor: (campaignId: string, dto: {
    doctorId: string; sessionId?: string; role?: string;
    doctorDuty?: DoctorDutyRole; isSigningDoctor?: boolean; isPrimarySupervisor?: boolean;
    assignedDate?: string; notes?: string | null
  }) => api.post<CampaignDoctor>(`/admin/campaigns/${campaignId}/doctors`, dto),
  updateDoctorAssignment: (campaignId: string, assignmentId: string, dto: {
    role?: string; doctorDuty?: DoctorDutyRole; isSigningDoctor?: boolean;
    isPrimarySupervisor?: boolean; isActive?: boolean; notes?: string | null
  }) => api.patch<CampaignDoctor>(`/admin/campaigns/${campaignId}/doctors/${assignmentId}`, dto),
  removeDoctorAssignment: (campaignId: string, assignmentId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/doctors/${assignmentId}`),
  bulkAssignDoctors: (campaignId: string, dto: {
    assignments: Array<{ doctorId: string; sessionId?: string; doctorDuty: DoctorDutyRole; isSigningDoctor?: boolean; isPrimarySupervisor?: boolean; notes?: string | null }>
  }) => api.post<{ results: unknown[]; total: number; succeeded: number }>(`/admin/campaigns/${campaignId}/doctors/bulk`, dto),
  getAvailableDoctors: (campaignId: string, params?: { page?: number; limit?: number; search?: string; includeAssigned?: boolean }) =>
    api.getPaginated<Doctor>(
      `/admin/campaigns/${campaignId}/available-doctors`,
      params as Record<string, string | number | boolean | undefined>,
    ),
  removeDoctor: (campaignId: string, assignmentId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/doctors/${assignmentId}`),

  // Staff Assignments
  listStaffAssignments: (campaignId: string, params?: { sessionId?: string; dutyRole?: StaffDutyRole; isActive?: boolean }) =>
    api.get<{ data: CampaignStaffAssignment[] }>(`/admin/campaigns/${campaignId}/staff-assignments`, params as Record<string, string | boolean | undefined>),
  assignStaff: (campaignId: string, dto: { userId: string; sessionId?: string; dutyRole: StaffDutyRole; notes?: string | null }) =>
    api.post<{ data: CampaignStaffAssignment }>(`/admin/campaigns/${campaignId}/staff-assignments`, dto),
  updateStaffAssignment: (campaignId: string, assignmentId: string, dto: { sessionId?: string | null; dutyRole?: StaffDutyRole; isActive?: boolean; notes?: string | null }) =>
    api.patch<{ data: CampaignStaffAssignment }>(`/admin/campaigns/${campaignId}/staff-assignments/${assignmentId}`, dto),
  deactivateStaffAssignment: (campaignId: string, assignmentId: string) =>
    api.delete<{ success: boolean }>(`/admin/campaigns/${campaignId}/staff-assignments/${assignmentId}`),
  bulkAssignStaff: (campaignId: string, dto: { assignments: Array<{ userId: string; sessionId?: string; dutyRole: StaffDutyRole; notes?: string | null }> }) =>
    api.post<{ data: { results: unknown[]; total: number; succeeded: number } }>(`/admin/campaigns/${campaignId}/staff-assignments/bulk`, dto),

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
  attachMedia: (campaignId: string, dto: { mediaFileId: string; role: CampaignMediaRole; altText?: string }) =>
    api.post<CampaignMedia>(`/admin/campaigns/${campaignId}/media/attach`, dto),
  updateMedia: (campaignId: string, mediaId: string, dto: { mediaFileId?: string; altText?: string | null; sortOrder?: number }) =>
    api.patch<CampaignMedia>(`/admin/campaigns/${campaignId}/media/${mediaId}`, dto),
  deleteMedia: (campaignId: string, mediaId: string) =>
    api.delete<void>(`/admin/campaigns/${campaignId}/media/${mediaId}`),
  reorderMedia: (campaignId: string, ids: string[]) =>
    api.patch<CampaignMedia[]>(`/admin/campaigns/${campaignId}/media/reorder`, { ids }),

  // Field Ops
  qrVerify: (campaignId: string, dto: { qrToken?: string; bookingReference?: string; sessionId?: string }) =>
    api.post<{ data: QRVerifyResult }>(`/admin/campaigns/${campaignId}/qr/verify`, dto),
  checkIn: (campaignId: string, dto: { registrationId?: string; petBookingId?: string; token?: string; sessionId?: string; adminOverride?: boolean }) =>
    api.post<{ data: { success: boolean; checkedInPetBookings: string[]; checkedInAt: string } }>(`/admin/campaigns/${campaignId}/check-in`, dto),
  vaccinationComplete: (campaignId: string, dto: { petBookingId: string; sessionId?: string; serviceId?: string; vaccineName?: string; batchNumber?: string; dose?: string; vaccinatedAt?: string; signingDoctorId?: string; remarks?: string; adminOverride?: boolean }) =>
    api.post<{ data: VaccinationCompleteResult }>(`/admin/campaigns/${campaignId}/vaccinations/complete`, dto),
  issueCertificate: (campaignId: string, dto: { petBookingId: string; signingDoctorId?: string }) =>
    api.post<{ data: CertificateIssueResult }>(`/admin/campaigns/${campaignId}/certificates/issue`, dto),
  resendCertificate: (campaignId: string, petBookingId: string) =>
    api.post<{ data: CertificateIssueResult }>(`/admin/campaigns/${campaignId}/certificates/resend`, { petBookingId }),
  getOperationalStats: (campaignId: string, sessionId?: string) =>
    api.get<{ data: FieldOpsStats }>(`/admin/campaigns/${campaignId}/operational-stats${sessionId ? `?sessionId=${sessionId}` : ''}`),
  getScanLogs: (campaignId: string, params?: { page?: number; limit?: number; sessionId?: string; scanResult?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<{ data: QRScanLogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/admin/campaigns/${campaignId}/scan-logs`, params as Record<string, string | number | undefined>),

  // My assigned campaigns (staff view)
  getMyAssignedCampaigns: () =>
    api.get<{ data: (CampaignListItem & { myAssignments: Array<{ id: string; dutyRole: StaffDutyRole; sessionId: string | null; session: CampaignSession | null; isActive: boolean }> })[] }>('/admin/my-assigned-campaigns'),

  // ─── Campaign FAQs ─────────────────────────────────────────────

  listCampaignFaqs: (campaignId: string) => api.get<CampaignFaq[]>(`/admin/campaigns/${campaignId}/faqs`),
  createCampaignFaq: (campaignId: string, dto: { questionEn: string; questionBn?: string | null; answerEn: string; answerBn?: string | null; category?: string | null; sortOrder?: number; isActive?: boolean }) =>
    api.post<CampaignFaq>(`/admin/campaigns/${campaignId}/faqs`, dto),
  updateCampaignFaq: (campaignId: string, faqId: string, dto: { questionEn?: string; questionBn?: string | null; answerEn?: string; answerBn?: string | null; category?: string | null; sortOrder?: number; isActive?: boolean }) =>
    api.patch<CampaignFaq>(`/admin/campaigns/${campaignId}/faqs/${faqId}`, dto),
  deleteCampaignFaq: (campaignId: string, faqId: string) => api.delete<void>(`/admin/campaigns/${campaignId}/faqs/${faqId}`),
  reorderCampaignFaqs: (campaignId: string, faqIds: string[]) =>
    api.patch<{ reordered: boolean }>(`/admin/campaigns/${campaignId}/faqs/reorder`, { faqIds }),
}
