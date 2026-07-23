import {
  APP_CONTROL_PAGE_OPTIONS,
  type AppControlDestinationType,
  type AppControlPayload,
  type AppControlRecord,
  type AppControlStatus,
  type AppControlTargetAudience,
  type AppThemeSettingPayload,
  type AppThemeSettingRecord,
  type AppVersionSettingPayload,
  type AppVersionSettingRecord,
} from '@/lib/api/app-control.api'

const APP_CONTROL_PAGE_KEYS = new Set<string>(APP_CONTROL_PAGE_OPTIONS.map((o) => o.value))

// Hosts used only for seed/demo filler content (see prisma/seed/app-control.seed.ts).
// This is deliberately narrow and used ONLY to decide whether to
// auto-clear an untouched Mobile Banner Image when the admin picks a new
// Main Banner Image in this authoring form — it must never be used to
// reject a legitimate externally-hosted image at render/runtime (that
// heuristic was removed from the Flutter client's media resolver entirely,
// since a real CMS-configured URL happening to use one of these hosts is
// still real content and must display normally).
const KNOWN_SEED_PLACEHOLDER_HOSTS = new Set([
  'placehold.co',
  'via.placeholder.com',
  'dummyimage.com',
  'placehold.jp',
  'fakeimg.pl',
])

/** True only for recognizable seed/demo placeholder-image-service URLs — never for a real upload or CDN URL. */
export function isKnownSeedPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const host = new URL(url).host.toLowerCase()
    return KNOWN_SEED_PLACEHOLDER_HOSTS.has(host)
  } catch {
    return false
  }
}

export type ResourceKind = 'standard' | 'theme' | 'version'

export type FormState = {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  mobileImageUrl: string
  ctaText: string
  destinationType: AppControlDestinationType
  destinationValue: string
  sortOrder: string
  startsAt: string
  endsAt: string
  isActive: boolean
  targetAudience: AppControlTargetAudience
  status: AppControlStatus
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  logoUrl?: string
  minimumVersion?: string
  latestVersion?: string
  forceUpdate?: boolean
  releaseNotes?: string
}

export const DEFAULT_FORM: FormState = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  mobileImageUrl: '',
  ctaText: '',
  destinationType: 'NONE',
  destinationValue: '',
  sortOrder: '0',
  startsAt: '',
  endsAt: '',
  isActive: true,
  targetAudience: 'all',
  status: 'draft',
  primaryColor: '',
  secondaryColor: '',
  accentColor: '',
  fontFamily: '',
  logoUrl: '',
  minimumVersion: '',
  latestVersion: '',
  forceUpdate: false,
  releaseNotes: '',
}

/** Converts an ISO string to a timezone-naive `YYYY-MM-DDTHH:mm` value for `<input type="datetime-local">`. */
export function toLocalDateTimeInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Converts a `datetime-local` input value to a full ISO-8601 string, or null when unset/invalid. Never throws. */
export function toApiDateTime(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

/** Converts the sortOrder form field (a string) to a non-negative integer. Never returns NaN. */
export function toApiSortOrder(value: string): number {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 0) return 0
  return parsed
}

export function getInitialForm(
  record?: AppControlRecord | AppThemeSettingRecord | AppVersionSettingRecord | null,
  defaults?: Partial<FormState>,
): FormState {
  if (!record) return { ...DEFAULT_FORM, ...defaults }
  return {
    title: record.title ?? '',
    subtitle: record.subtitle ?? '',
    description: record.description ?? '',
    imageUrl: record.imageUrl ?? '',
    mobileImageUrl: record.mobileImageUrl ?? '',
    ctaText: record.ctaText ?? '',
    destinationType: record.destinationType ?? 'NONE',
    destinationValue: record.destinationValue ?? '',
    sortOrder: String(record.sortOrder ?? 0),
    startsAt: toLocalDateTimeInput(record.startsAt),
    endsAt: toLocalDateTimeInput(record.endsAt),
    isActive: record.isActive ?? true,
    targetAudience: record.targetAudience ?? 'all',
    status: record.status ?? 'draft',
    primaryColor: 'primaryColor' in record ? (record.primaryColor ?? '') : '',
    secondaryColor: 'secondaryColor' in record ? (record.secondaryColor ?? '') : '',
    accentColor: 'accentColor' in record ? (record.accentColor ?? '') : '',
    fontFamily: 'fontFamily' in record ? (record.fontFamily ?? '') : '',
    logoUrl: 'logoUrl' in record ? (record.logoUrl ?? '') : '',
    minimumVersion: 'minimumVersion' in record ? (record.minimumVersion ?? '') : '',
    latestVersion: 'latestVersion' in record ? (record.latestVersion ?? '') : '',
    forceUpdate: 'forceUpdate' in record ? record.forceUpdate : false,
    releaseNotes: 'releaseNotes' in record ? (record.releaseNotes ?? '') : '',
    ...defaults,
  }
}

export function destinationValueLabel(type: AppControlDestinationType): string {
  switch (type) {
    case 'CAMPAIGN':
      return 'Campaign'
    case 'INTERNAL_PAGE':
      return 'App Page'
    case 'EXTERNAL_URL':
      return 'External URL'
    case 'MEMBERSHIP':
      return 'Membership Target'
    case 'DONATION':
      return 'Donation Target'
    case 'PET_CENSUS':
      return 'Pet Census Target'
    case 'SERVICE':
      return 'Service Target'
    default:
      return 'Destination'
  }
}

export function validateForm(form: FormState, kind: ResourceKind): string | null {
  if (!form.title.trim()) return 'Title is required.'
  if (form.startsAt && form.endsAt && new Date(form.endsAt) < new Date(form.startsAt)) return 'End date must be after start date.'
  if (form.destinationType === 'EXTERNAL_URL' && form.destinationValue.trim()) {
    try {
      new URL(form.destinationValue.trim())
    } catch {
      return 'Please enter a valid external URL.'
    }
  }
  if (form.destinationType !== 'NONE' && !form.destinationValue.trim()) return 'Destination target is required.'
  if (form.destinationType === 'CAMPAIGN' && !form.destinationValue.trim()) return 'Select a campaign.'
  if (form.destinationType === 'INTERNAL_PAGE' && form.destinationValue.trim() && !APP_CONTROL_PAGE_KEYS.has(form.destinationValue.trim())) {
    return 'Select a valid predefined app page.'
  }
  if (kind === 'version') {
    if (!form.minimumVersion?.trim()) return 'Minimum version is required.'
    if (!form.latestVersion?.trim()) return 'Latest version is required.'
  }
  return null
}

/**
 * Builds the create/update API payload from form state. Shared by both create and
 * update — there is no separate "edit" payload shape, only the target record id differs.
 */
export function buildPayload(form: FormState, kind: ResourceKind): AppControlPayload | AppThemeSettingPayload | AppVersionSettingPayload {
  const base: AppControlPayload = {
    title: form.title.trim() || null,
    subtitle: form.subtitle.trim() || null,
    description: form.description.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
    mobileImageUrl: form.mobileImageUrl.trim() || null,
    ctaText: form.ctaText.trim() || null,
    destinationType: form.destinationType,
    destinationValue: form.destinationType === 'NONE' ? null : form.destinationValue.trim() || null,
    sortOrder: toApiSortOrder(form.sortOrder),
    isActive: form.isActive,
    startsAt: toApiDateTime(form.startsAt),
    endsAt: toApiDateTime(form.endsAt),
    targetAudience: form.targetAudience,
    status: form.status,
  }

  if (kind === 'theme') {
    return {
      ...base,
      primaryColor: form.primaryColor?.trim() || null,
      secondaryColor: form.secondaryColor?.trim() || null,
      accentColor: form.accentColor?.trim() || null,
      fontFamily: form.fontFamily?.trim() || null,
      logoUrl: form.logoUrl?.trim() || null,
    }
  }

  if (kind === 'version') {
    return {
      ...base,
      minimumVersion: form.minimumVersion?.trim() || '',
      latestVersion: form.latestVersion?.trim() || '',
      forceUpdate: !!form.forceUpdate,
      releaseNotes: form.releaseNotes?.trim() || null,
    }
  }

  return base
}
