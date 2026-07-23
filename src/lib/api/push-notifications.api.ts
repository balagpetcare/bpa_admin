import { api } from '../api'

// ─── Enums ──────────────────────────────────────────────────────

export type NotificationCategory =
  | 'pet_health'
  | 'campaign'
  | 'video'
  | 'post'
  | 'membership'
  | 'booking'
  | 'payment'
  | 'certificate'
  | 'account'
  | 'emergency'
  | 'promotional'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical'

export type NotificationChannel = 'push' | 'in_app' | 'push_and_in_app'

export type AudienceType = 'all_users' | 'segment'

export type CampaignStatus = 'draft' | 'pending_approval' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed'

export type AutomationTriggerType = 'domain_event' | 'pet_reminder_schedule'

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'invalid_token' | 'opened' | 'clicked'

// ─── Shared shapes ──────────────────────────────────────────────

export interface AudienceFilter {
  locationIds?: string[]
  petTypes?: string[]
  campaignId?: string
  membershipTierIds?: string[]
  language?: 'en' | 'bn'
  platform?: 'android' | 'ios' | 'web'
  minAppVersion?: string
}

// ─── Templates ──────────────────────────────────────────────────

export interface NotificationTemplate {
  id: string
  key: string
  category: NotificationCategory
  title: string
  titleBn: string | null
  body: string
  bodyBn: string | null
  imageUrl: string | null
  deepLink: string | null
  defaultPriority: NotificationPriority
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateDto {
  key: string
  category: NotificationCategory
  title: string
  titleBn?: string | null
  body: string
  bodyBn?: string | null
  imageUrl?: string | null
  deepLink?: string | null
  defaultPriority: NotificationPriority
  isActive?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

// ─── Campaigns ──────────────────────────────────────────────────

export interface NotificationCampaign {
  id: string
  templateId: string | null
  title: string
  titleBn: string | null
  body: string
  bodyBn: string | null
  imageUrl: string | null
  deepLink: string | null
  category: NotificationCategory
  priority: NotificationPriority
  channel: NotificationChannel
  audienceType: AudienceType
  audienceFilter: AudienceFilter | null
  estimatedReach: number | null
  status: CampaignStatus
  scheduledAt: string | null
  expiresAt: string | null
  sentAt: string | null
  createdById: string | null
  approvedById: string | null
  approvedAt: string | null
  targetedCount: number
  attemptedCount: number
  acceptedCount: number
  failedCount: number
  openedCount: number
  clickedCount: number
  createdAt: string
  updatedAt: string
}

export interface CampaignListParams {
  status?: CampaignStatus
  page?: number
  limit?: number
}

export interface CreateCampaignDto {
  templateId?: string
  title: string
  titleBn?: string
  body: string
  bodyBn?: string
  imageUrl?: string
  deepLink?: string
  category: NotificationCategory
  priority: NotificationPriority
  channel: NotificationChannel
  audienceType: AudienceType
  audienceFilter?: AudienceFilter
  expiresAt?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface EstimateAudienceResult {
  estimatedReach: number
}

export interface PreviewResult {
  android: { title: string; body: string; imageUrl: string | null }
  ios: { title: string; body: string; imageUrl: string | null }
}

export interface TestSendResult {
  sent: boolean
  error?: string
}

export interface CampaignAnalytics {
  targetedCount: number
  attemptedCount: number
  acceptedCount: number
  failedCount: number
  openedCount: number
  clickedCount: number
  deliveryBreakdown?: Array<{ status: DeliveryStatus; count: number }>
}

// ─── Automation Rules ───────────────────────────────────────────

export interface AutomationRule {
  id: string
  name: string
  triggerType: AutomationTriggerType
  eventType: string | null
  offsetDays: number | null
  templateId: string
  category: NotificationCategory
  priority: NotificationPriority
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAutomationRuleDto {
  name: string
  triggerType: AutomationTriggerType
  eventType?: string
  offsetDays?: number
  templateId: string
  category: NotificationCategory
  priority: NotificationPriority
  isActive?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateAutomationRuleDto extends Partial<CreateAutomationRuleDto> {}

// ─── Deliveries & Audit ─────────────────────────────────────────

export interface NotificationDelivery {
  id: string
  campaignId: string
  userId: string
  status: DeliveryStatus
  lastError: string | null
  retryCount: number
  failedAt: string | null
}

export interface AuditEntry {
  id: string
  campaignId: string
  action: string
  actorId: string | null
  actorName?: string | null
  createdAt: string
  metadata?: Record<string, unknown>
}

const BASE = '/admin/push-notifications'

export const pushNotificationsApi = {
  // Templates
  listTemplates: (params?: { page?: number; limit?: number }) => api.getPaginated<NotificationTemplate>(`${BASE}/templates`, params),
  getTemplate: (id: string) => api.get<NotificationTemplate>(`${BASE}/templates/${id}`),
  createTemplate: (dto: CreateTemplateDto) => api.post<NotificationTemplate>(`${BASE}/templates`, dto),
  updateTemplate: (id: string, dto: UpdateTemplateDto) => api.patch<NotificationTemplate>(`${BASE}/templates/${id}`, dto),
  deleteTemplate: (id: string) => api.delete<void>(`${BASE}/templates/${id}`),

  // Campaigns
  listCampaigns: (params?: CampaignListParams) => api.getPaginated<NotificationCampaign>(`${BASE}/campaigns`, params as Record<string, string | number | undefined>),
  getCampaign: (id: string) => api.get<NotificationCampaign>(`${BASE}/campaigns/${id}`),
  createCampaign: (dto: CreateCampaignDto) => api.post<NotificationCampaign>(`${BASE}/campaigns`, dto),
  updateCampaign: (id: string, dto: UpdateCampaignDto) => api.patch<NotificationCampaign>(`${BASE}/campaigns/${id}`, dto),
  deleteCampaign: (id: string) => api.delete<void>(`${BASE}/campaigns/${id}`),

  estimateAudience: (id: string) => api.post<EstimateAudienceResult>(`${BASE}/campaigns/${id}/estimate-audience`, {}),
  preview: (id: string, language?: 'en' | 'bn') => api.post<PreviewResult>(`${BASE}/campaigns/${id}/preview`, language ? { language } : {}),
  testSend: (id: string, installationId: string) => api.post<TestSendResult>(`${BASE}/campaigns/${id}/test-send`, { installationId }),
  approve: (id: string) => api.post<NotificationCampaign>(`${BASE}/campaigns/${id}/approve`, {}),
  sendNow: (id: string) => api.post<NotificationCampaign>(`${BASE}/campaigns/${id}/send-now`, {}),
  schedule: (id: string, scheduledAt: string) => api.post<NotificationCampaign>(`${BASE}/campaigns/${id}/schedule`, { scheduledAt }),
  cancel: (id: string) => api.post<NotificationCampaign>(`${BASE}/campaigns/${id}/cancel`, {}),
  analytics: (id: string) => api.get<CampaignAnalytics>(`${BASE}/campaigns/${id}/analytics`),

  // Automation Rules
  listAutomationRules: (params?: { page?: number; limit?: number }) => api.getPaginated<AutomationRule>(`${BASE}/automation-rules`, params),
  createAutomationRule: (dto: CreateAutomationRuleDto) => api.post<AutomationRule>(`${BASE}/automation-rules`, dto),
  updateAutomationRule: (id: string, dto: UpdateAutomationRuleDto) => api.patch<AutomationRule>(`${BASE}/automation-rules/${id}`, dto),
  deleteAutomationRule: (id: string) => api.delete<void>(`${BASE}/automation-rules/${id}`),

  // Deliveries
  listFailedDeliveries: (params?: { page?: number; limit?: number }) => api.getPaginated<NotificationDelivery>(`${BASE}/deliveries/failed`, params),
  retryDelivery: (id: string) => api.post<{ retried: boolean }>(`${BASE}/deliveries/${id}/retry`, {}),

  // Audit
  listAudit: (params?: { page?: number; limit?: number }) => api.getPaginated<AuditEntry>(`${BASE}/audit`, params),
}
