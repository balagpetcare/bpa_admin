import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildPayload,
  getInitialForm,
  isKnownSeedPlaceholderUrl,
  toApiDateTime,
  toApiSortOrder,
  validateForm,
  DEFAULT_FORM,
} from './AppControlManager.helpers'
import { APP_CONTROL_PAGE_OPTIONS, type AppControlRecord } from '@/lib/api/app-control.api'

const existingBanner: AppControlRecord = {
  id: '10000000-0000-0000-0000-000000000401',
  title: 'Welcome to BPA App',
  subtitle: 'Draft Banner',
  description: 'Sample banner',
  imageUrl: 'https://cdn.example.com/banner.jpg',
  mobileImageUrl: 'https://cdn.example.com/banner-mobile.jpg',
  ctaText: 'Learn More',
  destinationType: 'INTERNAL_PAGE',
  destinationValue: 'app_dashboard',
  sortOrder: 2,
  isActive: true,
  startsAt: null,
  endsAt: null,
  targetAudience: 'all',
  status: 'draft',
  createdAt: '2026-07-22T21:28:57.940Z',
  updatedAt: '2026-07-22T21:29:46.424Z',
}

test('buildPayload produces a valid update payload for an unmodified edit (no field changes)', () => {
  const form = getInitialForm(existingBanner)
  const payload = buildPayload(form, 'standard')
  assert.equal(payload.title, 'Welcome to BPA App')
  assert.equal(payload.imageUrl, 'https://cdn.example.com/banner.jpg')
  assert.equal(payload.sortOrder, 2)
  assert.equal(payload.isActive, true)
})

test('toApiDateTime converts a datetime-local value to a full ISO-8601 string', () => {
  const iso = toApiDateTime('2026-07-25T14:30')
  assert.ok(iso)
  assert.match(iso as string, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
})

test('toApiDateTime preserves null for an intentionally unset optional date', () => {
  assert.equal(toApiDateTime(''), null)
})

test('toApiDateTime never throws and returns null for a locale-formatted date string', () => {
  assert.equal(toApiDateTime('22/7/2026, 11:00 PM'), null)
})

test('buildPayload round-trips startsAt/endsAt from record -> form -> payload as ISO strings', () => {
  const record: AppControlRecord = {
    ...existingBanner,
    startsAt: '2026-07-25T10:00:00.000Z',
    endsAt: '2026-07-26T10:00:00.000Z',
  }
  const form = getInitialForm(record)
  const payload = buildPayload(form, 'standard')
  assert.ok(payload.startsAt)
  assert.ok(payload.endsAt)
  assert.match(payload.startsAt as string, /Z$/)
  assert.match(payload.endsAt as string, /Z$/)
})

test('toApiSortOrder converts a numeric string to an integer', () => {
  assert.equal(toApiSortOrder('7'), 7)
})

test('toApiSortOrder never returns NaN for garbage input', () => {
  assert.equal(toApiSortOrder('abc'), 0)
  assert.equal(Number.isNaN(toApiSortOrder('abc')), false)
})

test('toApiSortOrder rejects negative values by clamping to 0', () => {
  assert.equal(toApiSortOrder('-5'), 0)
})

test('buildPayload sends the campaign database ID (not a title/label) as destinationValue for CAMPAIGN', () => {
  const form = { ...DEFAULT_FORM, title: 'Campaign Banner', destinationType: 'CAMPAIGN' as const, destinationValue: 'a55b02f4-1f84-433a-8164-1e54c58c1bb8' }
  const payload = buildPayload(form, 'standard')
  assert.equal(payload.destinationType, 'CAMPAIGN')
  assert.equal(payload.destinationValue, 'a55b02f4-1f84-433a-8164-1e54c58c1bb8')
})

test('buildPayload clears destinationValue when destinationType is NONE, even if a stale value lingers in form state', () => {
  const form = { ...DEFAULT_FORM, title: 'No destination', destinationType: 'NONE' as const, destinationValue: 'stale-leftover-value' }
  const payload = buildPayload(form, 'standard')
  assert.equal(payload.destinationValue, null)
})

test('buildPayload normalizes empty optional text fields to null, not empty string', () => {
  const form = { ...DEFAULT_FORM, title: 'Title only', subtitle: '', description: '', ctaText: '', mobileImageUrl: '' }
  const payload = buildPayload(form, 'standard')
  assert.equal(payload.subtitle, null)
  assert.equal(payload.description, null)
  assert.equal(payload.ctaText, null)
  assert.equal(payload.mobileImageUrl, null)
})

test('buildPayload preserves an existing image URL untouched when the user does not reselect media', () => {
  const form = getInitialForm(existingBanner)
  // Simulate editing an unrelated field (title) without touching the media picker.
  const edited = { ...form, title: 'Updated title only' }
  const payload = buildPayload(edited, 'standard')
  assert.equal(payload.imageUrl, existingBanner.imageUrl)
  assert.equal(payload.mobileImageUrl, existingBanner.mobileImageUrl)
})

test('validateForm rejects endDate before startDate', () => {
  const form = { ...DEFAULT_FORM, title: 'Scheduled banner', startsAt: '2026-07-25T10:00', endsAt: '2026-07-20T10:00' }
  const error = validateForm(form, 'standard')
  assert.equal(error, 'End date must be after start date.')
})

test('validateForm accepts endDate after startDate', () => {
  const form = { ...DEFAULT_FORM, title: 'Scheduled banner', startsAt: '2026-07-20T10:00', endsAt: '2026-07-25T10:00' }
  const error = validateForm(form, 'standard')
  assert.equal(error, null)
})

test('validateForm requires a campaign selection when destinationType is CAMPAIGN', () => {
  const form = { ...DEFAULT_FORM, title: 'Campaign banner', destinationType: 'CAMPAIGN' as const, destinationValue: '' }
  const error = validateForm(form, 'standard')
  assert.equal(error, 'Destination target is required.')
})

// ─── Regression coverage: seeded "Welcome to BPA App" banner edit defect ───
// Root cause was NOT in any of these fields (see app-control-actor-id.test.ts
// in bpa_api for the real defect) — this file's tests were already passing
// before the fix and did not catch the bug. These additions close specific
// gaps called out in the investigation rather than re-proving what already worked.

test('buildPayload sends the exact seeded disabled banner record unchanged (regression for record 10000000-0000-0000-0000-000000000401)', () => {
  const seededRecord: AppControlRecord = {
    id: '10000000-0000-0000-0000-000000000401',
    title: 'Welcome to BPA App',
    subtitle: 'Draft Banner',
    description: 'Sample banner seeded disabled by default for editorial setup.',
    imageUrl: 'https://placehold.co/1200x600?text=BPA+Banner+1',
    mobileImageUrl: 'https://placehold.co/720x960?text=BPA+Banner+1+Mobile',
    ctaText: 'Learn More',
    destinationType: 'INTERNAL_PAGE',
    destinationValue: 'app_dashboard',
    sortOrder: 0,
    isActive: false,
    startsAt: null,
    endsAt: null,
    targetAudience: 'all',
    status: 'draft',
    createdById: null,
    updatedById: null,
    createdAt: '2026-07-22T21:28:57.940Z',
    updatedAt: '2026-07-23T12:04:49.574Z',
  }
  const form = getInitialForm(seededRecord)
  const payload = buildPayload(form, 'standard')

  assert.deepEqual(payload, {
    title: 'Welcome to BPA App',
    subtitle: 'Draft Banner',
    description: 'Sample banner seeded disabled by default for editorial setup.',
    imageUrl: 'https://placehold.co/1200x600?text=BPA+Banner+1',
    mobileImageUrl: 'https://placehold.co/720x960?text=BPA+Banner+1+Mobile',
    ctaText: 'Learn More',
    destinationType: 'INTERNAL_PAGE',
    destinationValue: 'app_dashboard',
    sortOrder: 0,
    isActive: false,
    startsAt: null,
    endsAt: null,
    targetAudience: 'all',
    status: 'draft',
  })
})

test('APP_CONTROL_PAGE_OPTIONS values are snake_case API keys, never the human-readable label', () => {
  for (const option of APP_CONTROL_PAGE_OPTIONS) {
    assert.notEqual(option.value, option.label)
    assert.match(option.value, /^[a-z0-9_]+$/, `"${option.value}" must be a snake_case key, not a display label`)
  }
})

test('validateForm rejects a predefined-page destinationValue that is not one of the known app page keys', () => {
  const form = { ...DEFAULT_FORM, title: 'Bad page banner', destinationType: 'INTERNAL_PAGE' as const, destinationValue: 'Banners & Sliders' }
  const error = validateForm(form, 'standard')
  assert.equal(error, 'Select a valid predefined app page.')
})

test('validateForm accepts every real APP_CONTROL_PAGE_OPTIONS value for INTERNAL_PAGE', () => {
  for (const option of APP_CONTROL_PAGE_OPTIONS) {
    const form = { ...DEFAULT_FORM, title: 'Page banner', destinationType: 'INTERNAL_PAGE' as const, destinationValue: option.value }
    assert.equal(validateForm(form, 'standard'), null)
  }
})

test('buildPayload sends destinationValue as null (not empty string) when destinationType is NONE for a record that previously had an INTERNAL_PAGE value', () => {
  const record: AppControlRecord = {
    id: 'x',
    title: 'Switched destination',
    subtitle: null,
    description: null,
    imageUrl: null,
    mobileImageUrl: null,
    ctaText: null,
    destinationType: 'INTERNAL_PAGE',
    destinationValue: 'app_dashboard',
    sortOrder: 0,
    isActive: true,
    startsAt: null,
    endsAt: null,
    targetAudience: 'all',
    status: 'draft',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
  const form = getInitialForm(record)
  // Simulate the Destination Type <select> onChange handler, which clears
  // destinationValue as soon as the type changes (see AppControlManager.tsx).
  const switched = { ...form, destinationType: 'NONE' as const, destinationValue: '' }
  const payload = buildPayload(switched, 'standard')
  assert.equal(payload.destinationValue, null)
  assert.notEqual(payload.destinationValue, '')
})

test('buildPayload sends isActive as a real boolean, never a string, for both true and false', () => {
  const activeForm = { ...DEFAULT_FORM, title: 'Active', isActive: true }
  const inactiveForm = { ...DEFAULT_FORM, title: 'Inactive', isActive: false }
  assert.equal(buildPayload(activeForm, 'standard').isActive, true)
  assert.equal(typeof buildPayload(activeForm, 'standard').isActive, 'boolean')
  assert.equal(buildPayload(inactiveForm, 'standard').isActive, false)
  assert.equal(typeof buildPayload(inactiveForm, 'standard').isActive, 'boolean')
})

test('buildPayload never derives isActive from status or vice versa — a draft banner can be isActive:false independently', () => {
  const form = { ...DEFAULT_FORM, title: 'Draft + inactive', status: 'draft' as const, isActive: false }
  const payload = buildPayload(form, 'standard')
  assert.equal(payload.status, 'draft')
  assert.equal(payload.isActive, false)
})

test('destinationType stays UPPERCASE and targetAudience/status stay lowercase through the full record -> form -> payload round trip (no casing mixing)', () => {
  const record: AppControlRecord = {
    id: 'y',
    title: 'Casing check',
    subtitle: null,
    description: null,
    imageUrl: null,
    mobileImageUrl: null,
    ctaText: null,
    destinationType: 'EXTERNAL_URL',
    destinationValue: 'https://example.com',
    sortOrder: 0,
    isActive: true,
    startsAt: null,
    endsAt: null,
    targetAudience: 'member',
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
  const payload = buildPayload(getInitialForm(record), 'standard')
  assert.equal(payload.destinationType, 'EXTERNAL_URL')
  assert.equal(payload.destinationType, payload.destinationType?.toUpperCase())
  assert.equal(payload.targetAudience, 'member')
  assert.equal(payload.targetAudience, payload.targetAudience?.toLowerCase())
  assert.equal(payload.status, 'published')
  assert.equal(payload.status, payload.status?.toLowerCase())
})

// ─── Main/Mobile Banner Image UX: stale seed-placeholder detection ────────
// (used only to decide whether to auto-clear an untouched Mobile Banner
// Image when the admin picks a new Main Banner Image — never used to
// reject a legitimate remote URL at render time, which lives in the
// Flutter client's resolveMediaUrl instead.)

test('isKnownSeedPlaceholderUrl recognizes the real seeded placehold.co demo URLs', () => {
  assert.equal(isKnownSeedPlaceholderUrl('https://placehold.co/720x960?text=BPA+Banner+1+Mobile'), true)
  assert.equal(isKnownSeedPlaceholderUrl('https://via.placeholder.com/600x300'), true)
})

test('isKnownSeedPlaceholderUrl returns false for a real uploaded media URL', () => {
  assert.equal(isKnownSeedPlaceholderUrl('http://localhost:4000/uploads/6fabe994-7064-4447-92b9-d060092a279b.jpg'), false)
  assert.equal(isKnownSeedPlaceholderUrl('https://api.bpa.org.bd/uploads/real-banner.jpg'), false)
})

test('isKnownSeedPlaceholderUrl returns false for null/empty/malformed values', () => {
  assert.equal(isKnownSeedPlaceholderUrl(null), false)
  assert.equal(isKnownSeedPlaceholderUrl(''), false)
  assert.equal(isKnownSeedPlaceholderUrl('not-a-url'), false)
})
