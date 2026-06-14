import { api } from '../api'
import type { SocialImpactProgram, SocialImpactProgramType, PaginationQuery } from '@/types/bpa.types'

export interface SocialImpactProgramCreatePayload {
  titleEn: string
  titleBn: string
  descriptionEn?: string
  descriptionBn?: string
  impactType: SocialImpactProgramType
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

export type SocialImpactProgramUpdatePayload = Partial<SocialImpactProgramCreatePayload>

export const socialImpactProgramsApi = {
  list: (params?: PaginationQuery & { impactType?: SocialImpactProgramType; isActive?: boolean }) =>
    api.getPaginated<SocialImpactProgram>('/admin/social-impact-programs', params),
  getById: (id: string) =>
    api.get<SocialImpactProgram>(`/admin/social-impact-programs/${id}`),
  create: (data: SocialImpactProgramCreatePayload) =>
    api.post<SocialImpactProgram>('/admin/social-impact-programs', data),
  update: (id: string, data: SocialImpactProgramUpdatePayload) =>
    api.patch<SocialImpactProgram>(`/admin/social-impact-programs/${id}`, data),
  remove: (id: string) =>
    api.delete<void>(`/admin/social-impact-programs/${id}`),
}
