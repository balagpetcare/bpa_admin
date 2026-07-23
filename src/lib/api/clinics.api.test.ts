import assert from 'node:assert/strict'
import test from 'node:test'
import { clinicsApi } from './clinics.api'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1'
;(global as unknown as { window: unknown }).window = { location: { origin: 'http://localhost:3001' } }

function captureFetch() {
  const calls: { url: string; method?: string; body?: unknown }[] = []
  const original = global.fetch
  global.fetch = (async (url: string, opts?: RequestInit) => {
    calls.push({ url: String(url), method: opts?.method, body: opts?.body ? JSON.parse(String(opts.body)) : undefined })
    return {
      status: 200,
      ok: true,
      json: async () => ({ success: true, data: { id: 'branch-1' } }),
    } as Response
  }) as typeof fetch
  return { calls, restore: () => (global.fetch = original) }
}

test('branches.update sends a PATCH to the branch-specific route with the given id and body', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.branches.update('branch-1', { branchName: 'New Name', latitude: null })

  assert.equal(calls.length, 1)
  assert.match(calls[0].url, /\/admin\/clinics\/branches\/branch-1$/)
  assert.equal(calls[0].method, 'PATCH')
  assert.deepEqual(calls[0].body, { branchName: 'New Name', latitude: null })
})

test('branches.archive and branches.restore hit distinct routes, not the generic update route', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.branches.archive('branch-1', 'temporarily closed')
  await clinicsApi.branches.restore('branch-1')

  assert.match(calls[0].url, /\/branches\/branch-1\/archive$/)
  assert.deepEqual(calls[0].body, { reason: 'temporarily closed' })
  assert.match(calls[1].url, /\/branches\/branch-1\/restore$/)
})

test('branches.remove (permanent delete) sends DELETE with the reason/confirmationText body, not silently dropped', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.branches.remove('branch-1', { reason: 'duplicate test record', confirmationText: 'branch-slug' })

  assert.equal(calls[0].method, 'DELETE')
  assert.deepEqual(calls[0].body, { reason: 'duplicate test record', confirmationText: 'branch-slug' })
})

test('organizations.update sends a PATCH to the organization-specific route, not the branch route', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.organizations.update('org-1', { name: 'Renamed Org' })

  assert.match(calls[0].url, /\/admin\/clinics\/organizations\/org-1$/)
  assert.equal(calls[0].method, 'PATCH')
})

test('branches.updateRelated forwards services and animalTypes (previously missing from the DTO)', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.branches.updateRelated('branch-1', {
    services: [{ serviceName: 'Vaccination' }],
    animalTypes: [{ animalType: 'DOG' }],
  })

  assert.match(calls[0].url, /\/branches\/branch-1\/related$/)
  assert.deepEqual(calls[0].body, { services: [{ serviceName: 'Vaccination' }], animalTypes: [{ animalType: 'DOG' }] })
})

test('organizations.update sends logoMediaId/coverMediaId (the Media Library selection), never a pasted URL field', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.organizations.update('org-1', { logoMediaId: 'media-1', coverMediaId: null })

  assert.deepEqual(calls[0].body, { logoMediaId: 'media-1', coverMediaId: null })
})

test('branches.addImage sends the mediaFileId alongside the resolved url from the selected media asset', async (t) => {
  const { calls, restore } = captureFetch()
  t.after(restore)

  await clinicsApi.branches.addImage('branch-1', {
    url: 'https://cdn.example.com/media/photo.jpg',
    mediaFileId: 'media-1',
    isCover: true,
    altText: 'Reception desk',
  })

  assert.match(calls[0].url, /\/branches\/branch-1\/images$/)
  assert.equal(calls[0].method, 'POST')
  assert.deepEqual(calls[0].body, {
    url: 'https://cdn.example.com/media/photo.jpg',
    mediaFileId: 'media-1',
    isCover: true,
    altText: 'Reception desk',
  })
})
