import { api } from '../api'
import type { HeroSlide, HeroSlideListItem, HeroSlideStat } from '@/types/bpa.types'

export interface HeroSlidesListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'draft' | 'published' | 'archived' | ''
  locale?: 'en' | 'bn' | ''
}

export interface HeroSlideWriteDto {
  locale: 'en' | 'bn'
  title: string
  eyebrow?: string | null
  headline: string
  body?: string | null
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  mediaType: 'image' | 'video'
  overlayPosition: 'left' | 'center' | 'right'
  ctaType: 'none' | 'internal' | 'external'
  ctaLabel?: string | null
  ctaHref?: string | null
  ctaTarget: '_self' | '_blank'
  secondaryCtaType: 'none' | 'internal' | 'external'
  secondaryCtaLabel?: string | null
  secondaryCtaHref?: string | null
  secondaryCtaTarget: '_self' | '_blank'
  desktopImage: HeroSlide['desktopImage']
  mobileImage: HeroSlide['mobileImage']
  video?: HeroSlide['video']
  badgeText?: string | null
  campaignTag?: string | null
  stats?: HeroSlideStat[]
  countdownLabel?: string | null
  countdownTargetAt?: string | null
  startAt?: string | null
  endAt?: string | null
  sortOrder?: number
}

function toBackendDto(dto: HeroSlideWriteDto) {
  return {
    locale: dto.locale,
    title: dto.title,
    badgeText: dto.badgeText,
    eyebrow: dto.eyebrow,
    headline: dto.headline,
    body: dto.body,
    campaignTag: dto.campaignTag,
    status: dto.status,
    isActive: dto.isActive,
    mediaType: dto.mediaType,
    overlayPosition: dto.overlayPosition,
    ctaType: dto.ctaType,
    ctaLabel: dto.ctaLabel,
    ctaHref: dto.ctaHref,
    ctaTarget: dto.ctaTarget,
    secondaryCtaType: dto.secondaryCtaType,
    secondaryCtaLabel: dto.secondaryCtaLabel,
    secondaryCtaHref: dto.secondaryCtaHref,
    secondaryCtaTarget: dto.secondaryCtaTarget,
    desktopImageId: dto.desktopImage?.id,
    mobileImageId: dto.mobileImage?.id ?? null,
    videoId: dto.video?.id ?? null,
    stats: dto.stats?.map(({ label, value }) => ({ label, value })) ?? [],
    countdownLabel: dto.countdownLabel,
    countdownTargetAt: dto.countdownTargetAt,
    startAt: dto.startAt,
    endAt: dto.endAt,
    sortOrder: dto.sortOrder,
  }
}

function computeIsScheduledNow(slide: Pick<HeroSlideListItem, 'startAt' | 'endAt'>): boolean {
  const now = new Date()
  const startsOk = !slide.startAt || new Date(slide.startAt) <= now
  const endsOk = !slide.endAt || new Date(slide.endAt) >= now
  return startsOk && endsOk
}

function normalizeSlide(slide: HeroSlideListItem): HeroSlideListItem {
  return {
    ...slide,
    mobileImage: slide.mobileImage ?? slide.desktopImage,
    stats: Array.isArray(slide.stats)
      ? slide.stats.map((item, index) => ({ id: item.id ?? `stat-${index + 1}`, label: item.label, value: item.value }))
      : [],
    // Compute from actual dates — never default to true so the admin accurately shows schedule status
    isScheduledNow: slide.isScheduledNow ?? computeIsScheduledNow(slide),
  }
}

export const heroSliderApi = {
  list: (params?: HeroSlidesListParams) =>
    api
      .getPaginated<HeroSlideListItem>('/admin/homepage/hero-slides', params as Record<string, string | number | boolean | undefined>)
      .then((result) => ({ ...result, data: result.data.map(normalizeSlide) })),

  getById: (id: string) =>
    api.getPaginated<HeroSlideListItem>('/admin/homepage/hero-slides', { limit: 100 }).then((result) => {
      const slide = result.data.find((item) => item.id === id)
      if (!slide) throw new Error('Hero slide not found')
      return normalizeSlide(slide)
    }),

  create: (dto: HeroSlideWriteDto) => api.post<HeroSlideListItem>('/admin/homepage/hero-slides', toBackendDto(dto)).then(normalizeSlide),

  update: (id: string, dto: HeroSlideWriteDto) =>
    api.patch<HeroSlideListItem>(`/admin/homepage/hero-slides/${id}`, toBackendDto(dto)).then(normalizeSlide),

  remove: (id: string) => api.delete<void>(`/admin/homepage/hero-slides/${id}`),

  reorder: (ids: string[]) => Promise.resolve(ids).then(() => [] as HeroSlideListItem[]),

  listPublic: (locale?: 'en' | 'bn') =>
    api.get<HeroSlideListItem[]>('/homepage/public', { locale }).then((payload) => {
      const data = payload as unknown as { heroSlides?: HeroSlideListItem[] }
      return (data.heroSlides ?? []).map(normalizeSlide)
    }),
}
