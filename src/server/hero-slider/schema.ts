import * as yup from 'yup'
import type { HeroSlide, HeroSlideCtaType, HeroSlideLocale, HeroSlideMediaType, HeroSlideOverlayPosition, HeroSlideStatus } from '@/types/bpa.types'

const mediaRefSchema = yup
  .object({
    id: yup.string().required('Media id is required'),
    url: yup.string().url('Media URL must be valid').required('Media URL is required'),
    mimeType: yup.string().required('Media mime type is required'),
    altText: yup.string().nullable().default(null),
  })
  .nullable()
  .default(null)

const ctaTypeValues: HeroSlideCtaType[] = ['none', 'internal', 'external']
const localeValues: HeroSlideLocale[] = ['en', 'bn']
const mediaTypeValues: HeroSlideMediaType[] = ['image', 'video']
const overlayValues: HeroSlideOverlayPosition[] = ['left', 'center', 'right']
const statusValues: HeroSlideStatus[] = ['draft', 'published', 'archived']
const statSchema = yup.object({
  id: yup.string().required('Stat id is required'),
  label: yup.string().trim().required('Statistic label is required').max(60),
  value: yup.string().trim().required('Statistic value is required').max(60),
})

export const heroSlideInputSchema = yup.object({
  locale: yup.mixed<HeroSlideLocale>().oneOf(localeValues).required('Locale is required'),
  title: yup.string().trim().required('Slide title is required').max(120),
  badgeText: yup.string().trim().nullable().max(40).default(null),
  eyebrow: yup.string().trim().nullable().max(80).default(null),
  headline: yup.string().trim().required('Headline is required').max(180),
  body: yup.string().trim().nullable().max(600).default(null),
  campaignTag: yup.string().trim().nullable().max(60).default(null),
  status: yup.mixed<HeroSlideStatus>().oneOf(statusValues).required('Status is required'),
  isActive: yup.boolean().required(),
  mediaType: yup.mixed<HeroSlideMediaType>().oneOf(mediaTypeValues).required('Media type is required'),
  overlayPosition: yup.mixed<HeroSlideOverlayPosition>().oneOf(overlayValues).required('Overlay position is required'),
  ctaType: yup.mixed<HeroSlideCtaType>().oneOf(ctaTypeValues).required('CTA type is required'),
  ctaLabel: yup.string().trim().nullable().max(60).default(null),
  ctaHref: yup.string().trim().nullable().max(500).default(null),
  ctaTarget: yup.mixed<'_self' | '_blank'>().oneOf(['_self', '_blank']).required(),
  secondaryCtaType: yup.mixed<HeroSlideCtaType>().oneOf(ctaTypeValues).required(),
  secondaryCtaLabel: yup.string().trim().nullable().max(60).default(null),
  secondaryCtaHref: yup.string().trim().nullable().max(500).default(null),
  secondaryCtaTarget: yup.mixed<'_self' | '_blank'>().oneOf(['_self', '_blank']).required(),
  desktopImage: mediaRefSchema,
  mobileImage: mediaRefSchema,
  video: mediaRefSchema,
  stats: yup.array().of(statSchema).max(3).default([]),
  countdownLabel: yup.string().trim().nullable().max(80).default(null),
  countdownTargetAt: yup.string().nullable().default(null),
  startAt: yup.string().nullable().default(null),
  endAt: yup.string().nullable().default(null),
  sortOrder: yup.number().integer().min(0).default(0),
})

export type HeroSlideInput = yup.InferType<typeof heroSlideInputSchema>

export async function validateHeroSlideInput(input: unknown): Promise<HeroSlideInput> {
  const validated = await heroSlideInputSchema.validate(input, { abortEarly: false, stripUnknown: true })

  if (!validated.desktopImage) {
    throw new yup.ValidationError('Desktop image is required', undefined, 'desktopImage')
  }

  if (!validated.mobileImage) {
    throw new yup.ValidationError('Mobile image is required', undefined, 'mobileImage')
  }

  if (validated.mediaType === 'video' && !validated.video) {
    throw new yup.ValidationError('Video slide requires a video asset', undefined, 'video')
  }

  if (validated.mediaType === 'image') {
    validated.video = null
  }

  if (validated.ctaType === 'none') {
    validated.ctaLabel = null
    validated.ctaHref = null
    validated.ctaTarget = '_self'
  } else {
    if (!validated.ctaLabel) {
      throw new yup.ValidationError('CTA label is required when CTA is enabled', undefined, 'ctaLabel')
    }
    if (!validated.ctaHref) {
      throw new yup.ValidationError('CTA target is required when CTA is enabled', undefined, 'ctaHref')
    }
    if (validated.ctaType === 'internal' && !validated.ctaHref.startsWith('/')) {
      throw new yup.ValidationError('Internal CTA targets must start with "/"', undefined, 'ctaHref')
    }
    if (validated.ctaType === 'external') {
      try {
        new URL(validated.ctaHref)
      } catch {
        throw new yup.ValidationError('External CTA target must be a valid URL', undefined, 'ctaHref')
      }
    }
  }

  if (validated.secondaryCtaType === 'none') {
    validated.secondaryCtaLabel = null
    validated.secondaryCtaHref = null
    validated.secondaryCtaTarget = '_self'
  } else {
    if (!validated.secondaryCtaLabel) {
      throw new yup.ValidationError('Second CTA label is required when the second CTA is enabled', undefined, 'secondaryCtaLabel')
    }
    if (!validated.secondaryCtaHref) {
      throw new yup.ValidationError('Second CTA target is required when the second CTA is enabled', undefined, 'secondaryCtaHref')
    }
    if (validated.secondaryCtaType === 'internal' && !validated.secondaryCtaHref.startsWith('/')) {
      throw new yup.ValidationError('Internal second CTA targets must start with "/"', undefined, 'secondaryCtaHref')
    }
    if (validated.secondaryCtaType === 'external') {
      try {
        new URL(validated.secondaryCtaHref)
      } catch {
        throw new yup.ValidationError('External second CTA target must be a valid URL', undefined, 'secondaryCtaHref')
      }
    }
  }

  if (validated.startAt && Number.isNaN(Date.parse(validated.startAt))) {
    throw new yup.ValidationError('Start date must be a valid ISO date', undefined, 'startAt')
  }

  if (validated.endAt && Number.isNaN(Date.parse(validated.endAt))) {
    throw new yup.ValidationError('End date must be a valid ISO date', undefined, 'endAt')
  }

  if (validated.startAt && validated.endAt && new Date(validated.startAt) > new Date(validated.endAt)) {
    throw new yup.ValidationError('End date must be after the start date', undefined, 'endAt')
  }

  if (validated.countdownTargetAt && Number.isNaN(Date.parse(validated.countdownTargetAt))) {
    throw new yup.ValidationError('Countdown target must be a valid ISO date', undefined, 'countdownTargetAt')
  }

  if (validated.countdownTargetAt && !validated.countdownLabel) {
    throw new yup.ValidationError('Countdown label is required when countdown is enabled', undefined, 'countdownLabel')
  }

  if (!validated.desktopImage.mimeType.startsWith('image/')) {
    throw new yup.ValidationError('Desktop asset must be an image', undefined, 'desktopImage')
  }

  if (!validated.mobileImage.mimeType.startsWith('image/')) {
    throw new yup.ValidationError('Mobile asset must be an image', undefined, 'mobileImage')
  }

  if (validated.video && !validated.video.mimeType.startsWith('video/')) {
    throw new yup.ValidationError('Video asset must be a video file', undefined, 'video')
  }

  return validated
}

export function formatValidationErrors(error: unknown) {
  if (!(error instanceof yup.ValidationError)) return [{ message: String(error) }]

  if (error.inner.length === 0) {
    return [{ field: error.path ?? null, message: error.message }]
  }

  const seen = new Set<string>()
  return error.inner.flatMap((issue) => {
    const key = `${issue.path ?? 'root'}:${issue.message}`
    if (seen.has(key)) return []
    seen.add(key)
    return [{ field: issue.path ?? null, message: issue.message }]
  })
}

export function isSlideScheduledNow(slide: Pick<HeroSlide, 'startAt' | 'endAt'>, now = new Date()) {
  const startsOk = !slide.startAt || new Date(slide.startAt) <= now
  const endsOk = !slide.endAt || new Date(slide.endAt) >= now
  return startsOk && endsOk
}
