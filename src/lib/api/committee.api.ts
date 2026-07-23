import { api } from '../api'
import type { CommitteeMember } from '@/types/bpa.types'

export interface CreateCommitteeMemberDto {
  name: string
  designation: string
  bio?: string | null
  photoId?: string | null
  email?: string | null
  phone?: string | null
  sortOrder?: number
  isActive?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateCommitteeMemberDto extends Partial<CreateCommitteeMemberDto> {}

export interface ReorderDto {
  items: { id: string; sortOrder: number }[]
}

export const committeeApi = {
  list: (isActive?: boolean) => api.get<CommitteeMember[]>('/admin/committee', isActive !== undefined ? { isActive } : undefined),

  getById: (id: string) => api.get<CommitteeMember>(`/admin/committee/${id}`),

  create: (dto: CreateCommitteeMemberDto) => api.post<CommitteeMember>('/admin/committee', dto),

  update: (id: string, dto: UpdateCommitteeMemberDto) => api.put<CommitteeMember>(`/admin/committee/${id}`, dto),

  reorder: (dto: ReorderDto) => api.patch<CommitteeMember[]>('/admin/committee/reorder', dto),

  remove: (id: string) => api.delete<void>(`/admin/committee/${id}`),
}
