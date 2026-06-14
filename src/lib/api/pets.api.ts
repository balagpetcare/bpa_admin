import { api } from '../api'
import type { PetOwner, Pet, PaginatedResult, PetType, PetGender } from '@/types/bpa.types'

export interface PetOwnerListParams {
  page?: number; limit?: number; search?: string
}

export interface PetListParams {
  page?: number; limit?: number; search?: string; petOwnerId?: string; species?: PetType
}

export const petsApi = {
  // Pet Owners
  listOwners: (params?: PetOwnerListParams) =>
    api.get<PaginatedResult<PetOwner>>(
      '/admin/pets/owners',
      params as Record<string, string | number | boolean | undefined>,
    ),
  getOwner: (id: string) => api.get<PetOwner>(`/admin/pets/owners/${id}`),
  createOwner: (dto: { name: string; email?: string; phone?: string; address?: string }) =>
    api.post<PetOwner>('/admin/pets/owners', dto),
  updateOwner: (id: string, dto: Partial<{ name: string; email: string; phone: string; address: string }>) =>
    api.patch<PetOwner>(`/admin/pets/owners/${id}`, dto),
  deleteOwner: (id: string) => api.delete<void>(`/admin/pets/owners/${id}`),

  // Pets
  list: (params?: PetListParams) =>
    api.get<PaginatedResult<Pet>>(
      '/admin/pets',
      params as Record<string, string | number | boolean | undefined>,
    ),
  getById: (id: string) => api.get<Pet>(`/admin/pets/${id}`),
  create: (dto: { petOwnerId: string; name: string; species: PetType; breed?: string; gender: PetGender; dateOfBirth?: string; weightKg?: number; microchipNumber?: string; notes?: string }) =>
    api.post<Pet>('/admin/pets', dto),
  update: (id: string, dto: Partial<{ name: string; breed: string; gender: PetGender; dateOfBirth: string; weightKg: number; microchipNumber: string; notes: string; isActive: boolean }>) =>
    api.patch<Pet>(`/admin/pets/${id}`, dto),
  remove: (id: string) => api.delete<void>(`/admin/pets/${id}`),
}
