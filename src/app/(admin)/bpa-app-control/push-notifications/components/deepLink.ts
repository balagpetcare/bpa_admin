// Deep-link contract shared with the mobile app (bpa_user_app). Kept in sync
// manually with the backend's push-notifications module documentation.
const DEEP_LINK_PATTERNS: RegExp[] = [
  /^bpa:\/\/videos\/[^/]+$/,
  /^bpa:\/\/posts\/[^/]+$/,
  /^bpa:\/\/campaigns\/[^/]+$/,
  /^bpa:\/\/campaigns\/[^/]+\/booking$/,
  /^bpa:\/\/pets\/[^/]+$/,
  /^bpa:\/\/pets\/[^/]+\/vaccinations$/,
  /^bpa:\/\/certificates\/[^/]+$/,
  /^bpa:\/\/membership\/card$/,
  /^bpa:\/\/clinics\/[^/]+$/,
]

export function isValidDeepLink(value: string): boolean {
  if (!value) return true // optional field
  return DEEP_LINK_PATTERNS.some((re) => re.test(value.trim()))
}

export const DEEP_LINK_EXAMPLES = [
  'bpa://videos/{slug}',
  'bpa://posts/{slug}',
  'bpa://campaigns/{id}',
  'bpa://campaigns/{id}/booking',
  'bpa://pets/{id}',
  'bpa://pets/{id}/vaccinations',
  'bpa://certificates/{id}',
  'bpa://membership/card',
  'bpa://clinics/{id}',
]
