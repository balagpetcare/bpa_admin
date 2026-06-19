import { api } from '../api'
import type { AdminUser, PaginatedResult } from '@/types/bpa.types'

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  phone?: string
  roleIds?: string[]
}

export interface UpdateUserDto {
  name?: string
  email?: string
  password?: string
  phone?: string
  isActive?: boolean
  roleIds?: string[]
}

export const usersApi = {
  list: (params?: UserListParams) =>
    api.get<PaginatedResult<AdminUser>>('/admin/users', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) =>
    api.get<AdminUser>(`/admin/users/${id}`),

  create: (dto: CreateUserDto) =>
    api.post<AdminUser>('/admin/users', dto),

  update: (id: string, dto: UpdateUserDto) =>
    api.put<AdminUser>(`/admin/users/${id}`, dto),

  remove: (id: string) =>
    api.delete<void>(`/admin/users/${id}`),
}
