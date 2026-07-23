import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CONTENT_VIDEO_SOURCE_TYPES,
  buildContentPostPayload,
  toCategoryOptions,
} from './content-post-form.helpers'

const baseValues = {
  type: 'VIDEO' as const,
  titleEn: 'BPA Video',
  titleBn: 'বিপিএ ভিডিও',
  slug: 'bpa-video',
  summaryEn: '',
  summaryBn: '',
  bodyEn: '',
  bodyBn: '',
  coverImageUrl: null,
  thumbnailUrl: null,
  videoUrl: 'dQw4w9WgXcQ',
  videoProvider: 'youtube',
  videoSourceType: 'youtube' as const,
  videoFileUrl: null,
  videoFileKey: null,
  videoPosterUrl: null,
  durationSeconds: 123,
  status: 'published' as const,
  categoryId: '11111111-1111-4111-8111-111111111111',
  tags: [],
  allowComments: true,
  showOnHomepage: false,
  isFeatured: false,
  isPinned: false,
  homepagePriority: 0,
  ctaLabelEn: null,
  ctaLabelBn: null,
  ctaUrl: null,
  ctaType: null,
  publishedAtInput: '2026-07-24T09:30',
}

test('category dropdown options preserve the full category count', () => {
  const categories = Array.from({ length: 20 }, (_, index) => ({
    id: `cat-${index + 1}`,
    nameEn: `Category ${index + 1}`,
    nameBn: `ক্যাটাগরি ${index + 1}`,
    slug: `category-${index + 1}`,
    description: null,
    createdAt: '2026-07-22T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
  }))

  const options = toCategoryOptions(categories)

  assert.equal(options.length, 20)
  assert.deepEqual(options[0], { value: 'cat-1', label: 'Category 1' })
})

test('supported source types include youtube, vimeo, and upload', () => {
  assert.deepEqual(CONTENT_VIDEO_SOURCE_TYPES, ['youtube', 'vimeo', 'upload'])
})

test('published payload preserves a scheduled publish time instead of overwriting it', () => {
  const payload = buildContentPostPayload(baseValues, {
    nowIso: '2026-07-22T12:00:00.000Z',
  })

  assert.equal(payload.publishedAt, '2026-07-24T03:30:00.000Z')
  assert.equal(payload.durationSeconds, 123)
  assert.equal(payload.videoProvider, 'youtube')
})

test('unpublishing clears publishedAt', () => {
  const payload = buildContentPostPayload(
    {
      ...baseValues,
      status: 'draft',
      publishedAtInput: '2026-07-24T09:30',
    },
    { existingPublishedAt: '2026-07-20T10:00:00.000Z' },
  )

  assert.equal(payload.publishedAt, null)
})

test('uploaded videos do not force an external provider', () => {
  const payload = buildContentPostPayload(
    {
      ...baseValues,
      videoSourceType: 'upload',
      videoUrl: null,
      videoProvider: 'youtube',
      videoFileUrl: 'https://cdn.example.test/video.mp4',
    },
    { nowIso: '2026-07-22T12:00:00.000Z' },
  )

  assert.equal(payload.videoProvider, null)
})
