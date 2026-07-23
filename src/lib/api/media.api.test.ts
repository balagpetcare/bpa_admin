import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1'

// MediaPickerInput (the real consumer of this module) always runs client-side
// ('use client'), which is the code path that skips the server-only
// next/headers cookie lookup in lib/api.ts. Simulate that here rather than
// mocking next/headers, since it's the actual runtime environment.
;(global as unknown as { window: unknown }).window = { location: { origin: 'http://localhost:3001' } }

// Minimal fetch stub, restored after each test via t.after in node:test.
function stubFetch(response: { status: number; body: unknown }) {
  const original = global.fetch
  global.fetch = (async () =>
    ({
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      json: async () => response.body,
    }) as Response) as typeof fetch
  return () => {
    global.fetch = original
  }
}

const validMediaFile = {
  id: '013a2da5-e907-40be-856b-766b1831d71b',
  filename: 'media/2026/07/57813748-4805-45fd-87df-a006b701883f.jpg',
  originalName: 'photo.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: '203216',
  url: 'http://localhost:4000/uploads/57813748-4805-45fd-87df-a006b701883f.jpg',
  altText: null,
  uploadedById: null,
  createdAt: '2026-07-13T03:32:43.898Z',
  updatedAt: '2026-07-13T03:32:43.898Z',
}

test('mediaApi.list accepts the real API response contract (success/data/meta envelope)', async (t) => {
  const restore = stubFetch({
    status: 200,
    body: {
      success: true,
      data: [
        validMediaFile,
        { ...validMediaFile, id: 'a1b2c3d4-e5f6-4789-9abc-def012345678', missing: true, url: 'https://placehold.co/400x400?text=File+Missing' },
      ],
      meta: { page: 1, limit: 24, total: 2, totalPages: 1, hasNext: false, hasPrev: false },
    },
  })
  t.after(restore)

  const { mediaApi } = await import('./media.api')
  const result = await mediaApi.list({ page: 1, limit: 24, mimeType: 'image/' })

  assert.equal(result.data.length, 2)
  assert.equal(result.meta.total, 2)
  assert.equal(result.data[0].id, validMediaFile.id)
  assert.equal(result.data[1].missing, true)
})

test('mediaApi.list rejects a malformed item instead of silently returning undefined fields', async (t) => {
  const restore = stubFetch({
    status: 200,
    body: {
      success: true,
      data: [{ id: 'not-even-uuid-shaped', originalName: 'oops.jpg' /* missing required fields */ }],
      meta: { page: 1, limit: 24, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    },
  })
  t.after(restore)

  const { mediaApi } = await import('./media.api')
  await assert.rejects(() => mediaApi.list({ page: 1, limit: 24 }))
})

test('mediaApi.upload validates and returns the uploaded MediaFile shape', async (t) => {
  const restore = stubFetch({ status: 201, body: { success: true, data: validMediaFile } })
  t.after(restore)

  const { mediaApi } = await import('./media.api')
  const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
  const result = await mediaApi.upload(file)

  assert.equal(result.id, validMediaFile.id)
  assert.equal(result.url, validMediaFile.url)
})
