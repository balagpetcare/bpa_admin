import type { Category, ContentPost } from '@/lib/api/content.api'

export const CONTENT_VIDEO_SOURCE_TYPES = ['youtube', 'vimeo', 'upload'] as const

export type ContentVideoSourceType = (typeof CONTENT_VIDEO_SOURCE_TYPES)[number]

export interface ContentPostFormValuesForPayload {
  type: ContentPost['type']
  titleEn: string
  titleBn: string
  slug: string
  summaryEn: string
  summaryBn: string
  bodyEn: string
  bodyBn: string
  coverImageUrl: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  videoProvider: string | null
  videoSourceType: ContentVideoSourceType
  videoFileUrl: string | null
  videoFileKey: string | null
  videoPosterUrl: string | null
  durationSeconds: number | null
  status: ContentPost['status']
  categoryId: string | null
  tags: string[]
  allowComments: boolean
  showOnHomepage: boolean
  isFeatured: boolean
  isPinned: boolean
  homepagePriority: number
  ctaLabelEn: string | null
  ctaLabelBn: string | null
  ctaUrl: string | null
  ctaType: string | null
  publishedAtInput: string | null
}

export function toCategoryOptions(categories: Category[]) {
  return categories.map((category) => ({ value: category.id, label: category.nameEn }))
}

export function toDateTimeLocalInputValue(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) return ''
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return ''
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function buildContentPostPayload(
  values: ContentPostFormValuesForPayload,
  options?: {
    existingPublishedAt?: string | null
    nowIso?: string
  },
): Partial<ContentPost> {
  const selectedPublishedAt = normalizeNullableText(values.publishedAtInput)
  const existingPublishedAt = normalizeNullableText(options?.existingPublishedAt)
  const nowIso = options?.nowIso ?? new Date().toISOString()
  const durationSeconds =
    typeof values.durationSeconds === 'number' && Number.isFinite(values.durationSeconds) && values.durationSeconds > 0
      ? values.durationSeconds
      : null

  return {
    ...values,
    durationSeconds,
    videoUrl: normalizeNullableText(values.videoUrl),
    videoProvider:
      values.videoSourceType === 'youtube' || values.videoSourceType === 'vimeo' ? values.videoSourceType : null,
    publishedAt:
      values.status === 'published'
        ? selectedPublishedAt
          ? new Date(selectedPublishedAt).toISOString()
          : existingPublishedAt ?? nowIso
        : null,
  }
}
