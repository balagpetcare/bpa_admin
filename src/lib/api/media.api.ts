import { api, ApiError } from '../api'
import type { PaginatedResponse } from '../api'
import type { MediaFile } from '@/types/bpa.types'

export interface MediaListParams {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
}

// Runtime shape guard for the documented MediaFileResponse contract (see
// bpa_api's media.types.ts MediaFileResponse — the two must stay in sync).
// Every field the frontend actually reads is checked; this is intentionally
// not exhaustive Zod-style deep validation (this project uses yup for forms,
// not zod, so this stays dependency-free), but it fails loudly and clearly
// on shape drift instead of silently rendering `undefined` everywhere.
function isMediaFileShape(value: unknown): value is MediaFile {
  if (!value || typeof value !== 'object') return false
  const f = value as Record<string, unknown>
  return (
    typeof f.id === 'string' &&
    typeof f.filename === 'string' &&
    typeof f.originalName === 'string' &&
    typeof f.mimeType === 'string' &&
    typeof f.sizeBytes === 'string' &&
    typeof f.url === 'string' &&
    (f.altText === null || typeof f.altText === 'string') &&
    (f.uploadedById === null || typeof f.uploadedById === 'string') &&
    typeof f.createdAt === 'string' &&
    typeof f.updatedAt === 'string' &&
    (f.missing === undefined || typeof f.missing === 'boolean')
  )
}

function assertMediaFile(value: unknown, context: string): MediaFile {
  if (!isMediaFileShape(value)) {
    throw new ApiError('VALIDATION_ERROR', `Media API response did not match the expected shape (${context}).`)
  }
  return value
}

function assertMediaFileList(value: unknown[], context: string): MediaFile[] {
  return value.map((item, i) => assertMediaFile(item, `${context}[${i}]`))
}

export const mediaApi = {
  // api.getPaginated unwraps the { data, meta } envelope; api.get only returns json.data
  // which would be a plain array — causing data?.data to be undefined in the picker.
  list: async (params?: MediaListParams): Promise<PaginatedResponse<MediaFile>> => {
    const result = await api.getPaginated<MediaFile>('/admin/media', params as Record<string, string | number | boolean | undefined>)
    return { ...result, data: assertMediaFileList(result.data, 'media.list') }
  },

  getById: async (id: string): Promise<MediaFile> => {
    const result = await api.get<MediaFile>(`/admin/media/${id}`)
    return assertMediaFile(result, 'media.getById')
  },

  upload: async (file: File): Promise<MediaFile> => {
    const form = new FormData()
    form.append('file', file)
    const result = await api.upload<MediaFile>('/admin/media/upload', form)
    return assertMediaFile(result, 'media.upload')
  },

  updateAltText: async (id: string, altText: string | null): Promise<MediaFile> => {
    const result = await api.patch<MediaFile>(`/admin/media/${id}`, { altText })
    return assertMediaFile(result, 'media.updateAltText')
  },

  crop: async (
    id: string,
    dto: { x: number; y: number; width: number; height: number; targetWidth: number; targetHeight: number },
  ): Promise<MediaFile> => {
    const result = await api.post<MediaFile>(`/admin/media/${id}/crop`, dto)
    return assertMediaFile(result, 'media.crop')
  },

  remove: (id: string) => api.delete<void>(`/admin/media/${id}`),
}
