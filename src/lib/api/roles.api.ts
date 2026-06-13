import { api } from '../api'
import type { Role, Permission } from '@/types/bpa.types'

export interface CreateRoleDto {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleDto {
  name?: string
  description?: string
  permissionIds?: string[]
}

export const rolesApi = {
  list: () => api.get<Role[]>('/admin/roles'),

  getById: (id: string) => api.get<Role>(`/admin/roles/${id}`),

  listPermissions: () => api.get<Permission[]>('/admin/roles/permissions'),

  create: (dto: CreateRoleDto) => api.post<Role>('/admin/roles', dto),

  update: (id: string, dto: UpdateRoleDto) => api.put<Role>(`/admin/roles/${id}`, dto),

  remove: (id: string) => api.delete<void>(`/admin/roles/${id}`),
}
