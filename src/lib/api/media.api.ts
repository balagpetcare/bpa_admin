import { api } from '../api'
import type { MediaFile } from '@/types/bpa.types'

export interface MediaListParams {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
}

export const mediaApi = {
  // api.getPaginated unwraps the { data, meta } envelope; api.get only returns json.data
  // which would be a plain array — causing data?.data to be undefined in the picker.
  list: (params?: MediaListParams) =>
    api.getPaginated<MediaFile>(
      '/admin/media',
      params as Record<string, string | number | boolean | undefined>,
    ),

  getById: (id: string) => api.get<MediaFile>(`/admin/media/${id}`),

  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.upload<MediaFile>('/admin/media/upload', form)
  },

  updateAltText: (id: string, altText: string | null) =>
    api.patch<MediaFile>(`/admin/media/${id}`, { altText }),

  crop: (id: string, dto: { x: number; y: number; width: number; height: number; targetWidth: number; targetHeight: number }) =>
    api.post<MediaFile>(`/admin/media/${id}/crop`, dto),

  remove: (id: string) => api.delete<void>(`/admin/media/${id}`),
}
