import { api, apiClient } from '../api'
import type {
  FooterConfig,
  FooterLinkGroup,
  HeroSlideListItem,
  Homepage,
  HomepageSection,
  HomepageSectionSource,
  HomepageSectionType,
  PaginatedResult,
  Partner,
} from '@/types/bpa.types'

export interface HomepageSectionDto {
  locale?: string
  type: HomepageSectionType
  source: HomepageSectionSource
  title?: string | null
  eyebrow?: string | null
  subtitle?: string | null
  body?: string | null
  ctaType?: 'none' | 'internal' | 'external'
  ctaLabel?: string | null
  ctaHref?: string | null
  ctaTarget?: '_self' | '_blank'
  itemLimit?: number
  content?: Record<string, unknown> | null
  isVisible?: boolean
  sortOrder?: number
  startAt?: string | null
  endAt?: string | null
}

export interface PartnerDto {
  name: string
  description?: string | null
  logoId?: string | null
  url?: string | null
  tier?: string | null
  isActive?: boolean
  sortOrder?: number
  startAt?: string | null
  endAt?: string | null
}

export interface FooterDto {
  locale?: string
  brandName?: string | null
  brandText?: string | null
  logoId?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  copyrightText?: string | null
  socialLinks?: Array<{ label: string; href: string }> | null
  isActive?: boolean
  groups: FooterLinkGroup[]
}

export const homepageApi = {
  get: (locale = 'en') => api.get<Homepage>('/admin/homepage', { locale }),
  update: (payload: { locale?: string; title?: string | null; description?: string | null; settings?: Record<string, unknown> | null }) =>
    api.put<Homepage>('/admin/homepage', payload),
  publish: (locale = 'en') => apiClient<Homepage>('/admin/homepage/publish', { method: 'POST', params: { locale } }),

  listSections: (params?: { locale?: string; page?: number; limit?: number; type?: HomepageSectionType; isVisible?: boolean }) =>
    api.getPaginated<HomepageSection>('/admin/homepage/sections', {
      ...params,
      isVisible: params?.isVisible === undefined ? undefined : String(params.isVisible),
    }),
  createSection: (payload: HomepageSectionDto) => api.post<HomepageSection>('/admin/homepage/sections', payload),
  updateSection: (id: string, payload: Partial<HomepageSectionDto>) => api.patch<HomepageSection>(`/admin/homepage/sections/${id}`, payload),
  deleteSection: (id: string) => api.delete<void>(`/admin/homepage/sections/${id}`),
  reorderSections: (locale: string, items: { id: string; sortOrder: number }[]) =>
    api.patch<PaginatedResult<HomepageSection>>('/admin/homepage/sections/reorder', { locale, items }),

  listHeroSlides: (params?: { locale?: string; page?: number; limit?: number; status?: string; isActive?: boolean; search?: string }) =>
    api.getPaginated<HeroSlideListItem>('/admin/homepage/hero-slides', {
      ...params,
      isActive: params?.isActive === undefined ? undefined : String(params.isActive),
    }),

  listPartners: (params?: { page?: number; limit?: number; isActive?: boolean; search?: string }) =>
    api.getPaginated<Partner>('/admin/homepage/partners', {
      ...params,
      isActive: params?.isActive === undefined ? undefined : String(params.isActive),
    }),
  createPartner: (payload: PartnerDto) => api.post<Partner>('/admin/homepage/partners', payload),
  updatePartner: (id: string, payload: Partial<PartnerDto>) => api.patch<Partner>(`/admin/homepage/partners/${id}`, payload),
  deletePartner: (id: string) => api.delete<void>(`/admin/homepage/partners/${id}`),

  getFooter: (locale = 'en') => api.get<FooterConfig | null>('/admin/homepage/footer', { locale }),
  upsertFooter: (payload: FooterDto) => api.put<FooterConfig>('/admin/homepage/footer', payload),
}
