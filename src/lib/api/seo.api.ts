import { api } from '../api'
import type { SeoMetadata } from '@/types/bpa.types'

export interface UpsertSeoDto {
  title?: string | null
  description?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImageId?: string | null
  schemaJson?: Record<string, unknown> | null
}

export const seoApi = {
  list: () => api.get<SeoMetadata[]>('/admin/seo'),

  getByRoute: (route: string) =>
    api.get<SeoMetadata | null>(`/admin/seo/${encodeURIComponent(route)}`),

  upsert: (route: string, dto: UpsertSeoDto) =>
    api.put<SeoMetadata>(`/admin/seo/${encodeURIComponent(route)}`, dto),

  remove: (route: string) =>
    api.delete<void>(`/admin/seo/${encodeURIComponent(route)}`),
}
