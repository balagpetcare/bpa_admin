import { api } from '../api'

export interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  module: string | null
  entityType: string | null
  entityId: string | null
  priority: 'low' | 'normal' | 'high' | 'critical'
  status: 'unread' | 'read' | 'dismissed'
  actionUrl: string | null
  metadata: Record<string, unknown> | null
  dedupeKey: string | null
  createdForRole: string | null
  readAt: string | null
  dismissedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UnreadCountResponse {
  count: number
}

export interface MarkAllReadBody {
  type?: string
  module?: string
}

export const notificationsApi = {
  list: (params?: Record<string, string | undefined>) => api.getPaginated<AdminNotification>('/admin/notifications', params as any),

  unreadCount: () => api.get<UnreadCountResponse>('/admin/notifications/unread-count'),

  markRead: (id: string) => api.patch<{ id: string; status: string }>(`/admin/notifications/${id}/read`),

  dismiss: (id: string) => api.patch<{ id: string; status: string }>(`/admin/notifications/${id}/dismiss`),

  markAllRead: (body?: MarkAllReadBody) => api.patch<{ updated: number }>('/admin/notifications/mark-all-read', body),
}
