import { api } from '../api'
import type { RoadmapItem, RoadmapItemStatus, PaginationQuery } from '@/types/bpa.types'

export interface RoadmapItemCreatePayload {
  phase: string
  year: number
  titleEn: string
  titleBn: string
  descriptionEn?: string
  descriptionBn?: string
  status?: RoadmapItemStatus
  sortOrder?: number
  isActive?: boolean
}

export type RoadmapItemUpdatePayload = Partial<RoadmapItemCreatePayload>

export const roadmapItemsApi = {
  list: (params?: PaginationQuery & { status?: RoadmapItemStatus; year?: number; isActive?: boolean }) =>
    api.getPaginated<RoadmapItem>('/admin/roadmap-items', params),
  getById: (id: string) =>
    api.get<RoadmapItem>(`/admin/roadmap-items/${id}`),
  create: (data: RoadmapItemCreatePayload) =>
    api.post<RoadmapItem>('/admin/roadmap-items', data),
  update: (id: string, data: RoadmapItemUpdatePayload) =>
    api.patch<RoadmapItem>(`/admin/roadmap-items/${id}`, data),
  remove: (id: string) =>
    api.delete<void>(`/admin/roadmap-items/${id}`),
}
