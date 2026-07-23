import { api, apiClientPaginated, type PaginationMeta } from '@/lib/api'

const BASE = '/admin/contact-inquiries'

// ─── Types ────────────────────────────────────────────────────────

export type InquiryPriority = 'normal' | 'high' | 'urgent'
export type InquiryStatus = 'new' | 'read' | 'pending' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed' | 'spam'

export interface ContactType {
  id: string
  slug: string
  labelEn: string
  labelBn?: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface InquiryCategory {
  id: string
  slug: string
  labelEn: string
  labelBn?: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ContactDepartment {
  id: string
  slug: string
  nameEn: string
  nameBn?: string
  description?: string
  contactEmail?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ContactPriorityRule {
  id: string
  contactTypeSlug?: string
  categorySlug?: string
  priority: InquiryPriority
  departmentId?: string
  department?: { nameEn: string }
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface InquiryListItem {
  id: string
  ticketNumber: string
  name: string
  email: string
  phone?: string
  subject: string
  priority: InquiryPriority
  status: InquiryStatus
  country?: string
  createdAt: string
  readAt?: string
  contactType?: { slug: string; labelEn: string }
  category?: { slug: string; labelEn: string }
  department?: { slug: string; nameEn: string }
  assignedTo?: { id: string; name: string }
}

export interface InquiryReply {
  id: string
  toAddresses: string[]
  ccAddresses: string[]
  subject: string
  bodyHtml: string
  sentAt: string
  sentBy: { id: string; name: string }
}

export interface InquiryForward {
  id: string
  toAddresses: string[]
  subject: string
  note?: string
  forwardedAt: string
  forwardedBy: { id: string; name: string }
}

export interface InquiryNote {
  id: string
  note: string
  createdAt: string
  updatedAt: string
  createdBy: { id: string; name: string }
}

export interface InquiryDetail extends InquiryListItem {
  whatsapp?: string
  city?: string
  organizationName?: string
  designation?: string
  website?: string
  message: string
  attachmentUrl?: string
  consentGiven: boolean
  ipAddress?: string
  source?: string
  resolvedAt?: string
  closedAt?: string
  contactType?: { slug: string; labelEn: string; labelBn?: string }
  category?: { slug: string; labelEn: string; labelBn?: string }
  department?: { id: string; slug: string; nameEn: string; contactEmail?: string }
  assignedTo?: { id: string; name: string; email: string }
  replies: InquiryReply[]
  forwards: InquiryForward[]
  internalNotes: InquiryNote[]
}

export interface InquiryListParams {
  page?: number
  limit?: number
  search?: string
  status?: InquiryStatus
  priority?: InquiryPriority
  contactTypeId?: string
  categoryId?: string
  departmentId?: string
  country?: string
  dateFrom?: string
  dateTo?: string
}

// ─── Inquiry Inbox ────────────────────────────────────────────────

export const contactInquiryApi = {
  list: (params?: InquiryListParams) => apiClientPaginated<InquiryListItem>(BASE, { method: 'GET', params: params as Record<string, string> }),

  getById: (id: string) => api.get<InquiryDetail>(`${BASE}/${id}`),

  updateStatus: (id: string, status: InquiryStatus) => api.patch(`${BASE}/${id}/status`, { status }),

  assign: (id: string, data: { departmentId?: string | null; assignedToId?: string | null; priority?: InquiryPriority }) =>
    api.patch(`${BASE}/${id}/assign`, data),

  reply: (
    id: string,
    data: {
      fromAccountId: string
      to: string[]
      cc?: string[]
      subject: string
      bodyHtml: string
      useTemplate?: boolean
      layoutKey?: string
      markResolved?: boolean
    },
  ) => api.post(`${BASE}/${id}/reply`, data),

  forward: (
    id: string,
    data: {
      fromAccountId: string
      to: string[]
      cc?: string[]
      subject: string
      bodyHtml: string
      note?: string
    },
  ) => api.post(`${BASE}/${id}/forward`, data),

  sendSms: (id: string, data: { phone: string; message: string }) => api.post(`${BASE}/${id}/sms`, data),

  addNote: (id: string, note: string) => api.post(`${BASE}/${id}/notes`, { note }),

  deleteNote: (id: string, noteId: string) => api.delete(`${BASE}/${id}/notes/${noteId}`),
}

// ─── Config: Contact Types ────────────────────────────────────────

export const contactTypeApi = {
  list: () => api.get<ContactType[]>(`${BASE}/config/types`),
  getById: (id: string) => api.get<ContactType>(`${BASE}/config/types/${id}`),
  create: (data: Partial<ContactType>) => api.post<ContactType>(`${BASE}/config/types`, data),
  update: (id: string, data: Partial<ContactType>) => api.patch<ContactType>(`${BASE}/config/types/${id}`, data),
  delete: (id: string) => api.delete(`${BASE}/config/types/${id}`),
}

// ─── Config: Categories ───────────────────────────────────────────

export const inquiryCategoryApi = {
  list: () => api.get<InquiryCategory[]>(`${BASE}/config/categories`),
  getById: (id: string) => api.get<InquiryCategory>(`${BASE}/config/categories/${id}`),
  create: (data: Partial<InquiryCategory>) => api.post<InquiryCategory>(`${BASE}/config/categories`, data),
  update: (id: string, data: Partial<InquiryCategory>) => api.patch<InquiryCategory>(`${BASE}/config/categories/${id}`, data),
  delete: (id: string) => api.delete(`${BASE}/config/categories/${id}`),
}

// ─── Config: Departments ──────────────────────────────────────────

export const contactDepartmentApi = {
  list: () => api.get<ContactDepartment[]>(`${BASE}/config/departments`),
  getById: (id: string) => api.get<ContactDepartment>(`${BASE}/config/departments/${id}`),
  create: (data: Partial<ContactDepartment>) => api.post<ContactDepartment>(`${BASE}/config/departments`, data),
  update: (id: string, data: Partial<ContactDepartment>) => api.patch<ContactDepartment>(`${BASE}/config/departments/${id}`, data),
  delete: (id: string) => api.delete(`${BASE}/config/departments/${id}`),
}

// ─── Config: Priority Rules ───────────────────────────────────────

export const priorityRuleApi = {
  list: () => api.get<ContactPriorityRule[]>(`${BASE}/config/priority-rules`),
  getById: (id: string) => api.get<ContactPriorityRule>(`${BASE}/config/priority-rules/${id}`),
  create: (data: Partial<ContactPriorityRule>) => api.post<ContactPriorityRule>(`${BASE}/config/priority-rules`, data),
  update: (id: string, data: Partial<ContactPriorityRule>) => api.patch<ContactPriorityRule>(`${BASE}/config/priority-rules/${id}`, data),
  delete: (id: string) => api.delete(`${BASE}/config/priority-rules/${id}`),
}
