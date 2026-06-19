import { api } from '../api'
import type { Doctor, PaginatedResult } from '@/types/bpa.types'

export interface DoctorListParams {
  page?: number; limit?: number; search?: string; isActive?: 'true' | 'false' | 'all' | boolean
}

export const doctorsApi = {
  list: (params?: DoctorListParams) =>
    api.getPaginated<Doctor>(
      '/admin/doctors',
      params as Record<string, string | number | boolean | undefined>,
    ),
  getById: (id: string) => api.get<Doctor>(`/admin/doctors/${id}`),
  create: (dto: { name: string; email?: string; phone?: string; licenseNumber?: string; specialization?: string; bio?: string }) =>
    api.post<Doctor>('/admin/doctors', dto),
  update: (id: string, dto: Partial<{ name: string; email: string; phone: string; licenseNumber: string; specialization: string; bio: string; isActive: boolean }>) =>
    api.patch<Doctor>(`/admin/doctors/${id}`, dto),
  remove: (id: string) => api.delete<void>(`/admin/doctors/${id}`),
}
