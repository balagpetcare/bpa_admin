import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { HeroSlide, HeroSlideListItem, HeroSlideStatus, HeroSlideStat } from '@/types/bpa.types'
import type { HeroSlideInput } from './schema'
import { isSlideScheduledNow } from './schema'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'hero-slides.json')

interface HeroSlideStoreShape {
  slides: HeroSlide[]
}

interface ListSlidesOptions {
  includeArchived?: boolean
  locale?: string | null
  search?: string | null
  status?: HeroSlideStatus | ''
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    await readFile(DATA_FILE, 'utf8')
  } catch {
    const initial: HeroSlideStoreShape = { slides: [] }
    await writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8')
  }
}

async function readStore(): Promise<HeroSlideStoreShape> {
  await ensureStore()
  const raw = await readFile(DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw) as HeroSlideStoreShape
  return {
    slides: (parsed.slides ?? []).map(normalizeLegacySlide),
  }
}

async function writeStore(data: HeroSlideStoreShape) {
  await ensureStore()
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function sortSlides(slides: HeroSlide[]) {
  return [...slides].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
}

function toListItem(slide: HeroSlide): HeroSlideListItem {
  return {
    ...slide,
    isScheduledNow: isSlideScheduledNow(slide),
  }
}

function normalizeStats(stats: unknown): HeroSlideStat[] {
  if (!Array.isArray(stats)) return []

  return stats
    .filter((item): item is { id?: string; label?: string; value?: string } => typeof item === 'object' && item !== null)
    .map((item, index) => ({
      id: item.id ?? `stat-${index + 1}`,
      label: item.label ?? '',
      value: item.value ?? '',
    }))
    .filter((item) => item.label || item.value)
    .slice(0, 3)
}

function normalizeLegacySlide(slide: HeroSlide): HeroSlide {
  return {
    ...slide,
    badgeText: slide.badgeText ?? null,
    campaignTag: slide.campaignTag ?? null,
    secondaryCtaType: slide.secondaryCtaType ?? 'none',
    secondaryCtaLabel: slide.secondaryCtaLabel ?? null,
    secondaryCtaHref: slide.secondaryCtaHref ?? null,
    secondaryCtaTarget: slide.secondaryCtaTarget ?? '_self',
    stats: normalizeStats(slide.stats),
    countdownLabel: slide.countdownLabel ?? null,
    countdownTargetAt: slide.countdownTargetAt ?? null,
  }
}

function normalizeSortOrder(slides: HeroSlide[]) {
  return sortSlides(slides).map((slide, index) => ({ ...slide, sortOrder: index }))
}

export async function listHeroSlides(options: ListSlidesOptions = {}) {
  const store = await readStore()
  const search = options.search?.trim().toLowerCase()

  const filtered = store.slides.filter((slide) => {
    if (!options.includeArchived && slide.status === 'archived') return false
    if (options.locale && slide.locale !== options.locale) return false
    if (options.status && slide.status !== options.status) return false
    if (!search) return true

    return [
      slide.title,
      slide.headline,
      slide.eyebrow ?? '',
      slide.body ?? '',
      slide.ctaLabel ?? '',
    ].some((value) => value.toLowerCase().includes(search))
  })

  return sortSlides(filtered).map(toListItem)
}

export async function getHeroSlideById(id: string) {
  const store = await readStore()
  const slide = store.slides.find((item) => item.id === id)
  return slide ? toListItem(slide) : null
}

export async function createHeroSlide(input: HeroSlideInput) {
  const store = await readStore()
  const now = new Date().toISOString()
  const maxSortOrder = store.slides.length === 0 ? -1 : Math.max(...store.slides.map((slide) => slide.sortOrder))

  const slide: HeroSlide = {
    id: crypto.randomUUID(),
    locale: input.locale,
    title: input.title,
    badgeText: input.badgeText ?? null,
    eyebrow: input.eyebrow ?? null,
    headline: input.headline,
    body: input.body ?? null,
    campaignTag: input.campaignTag ?? null,
    status: input.status,
    isActive: input.isActive,
    mediaType: input.mediaType,
    overlayPosition: input.overlayPosition,
    ctaType: input.ctaType,
    ctaLabel: input.ctaLabel ?? null,
    ctaHref: input.ctaHref ?? null,
    ctaTarget: input.ctaTarget,
    secondaryCtaType: input.secondaryCtaType,
    secondaryCtaLabel: input.secondaryCtaLabel ?? null,
    secondaryCtaHref: input.secondaryCtaHref ?? null,
    secondaryCtaTarget: input.secondaryCtaTarget,
    desktopImage: input.desktopImage,
    mobileImage: input.mobileImage,
    video: input.video ?? null,
    stats: normalizeStats(input.stats),
    countdownLabel: input.countdownLabel ?? null,
    countdownTargetAt: input.countdownTargetAt ?? null,
    startAt: input.startAt ?? null,
    endAt: input.endAt ?? null,
    sortOrder: typeof input.sortOrder === 'number' ? input.sortOrder : maxSortOrder + 1,
    createdAt: now,
    updatedAt: now,
  }

  store.slides.push(slide)
  store.slides = normalizeSortOrder(store.slides)
  await writeStore(store)

  const saved = store.slides.find((item) => item.id === slide.id)!
  return toListItem(saved)
}

export async function updateHeroSlide(id: string, input: HeroSlideInput) {
  const store = await readStore()
  const index = store.slides.findIndex((slide) => slide.id === id)
  if (index === -1) return null

  const existing = store.slides[index]
  store.slides[index] = {
    ...existing,
    ...input,
    badgeText: input.badgeText ?? null,
    eyebrow: input.eyebrow ?? null,
    body: input.body ?? null,
    campaignTag: input.campaignTag ?? null,
    ctaLabel: input.ctaLabel ?? null,
    ctaHref: input.ctaHref ?? null,
    secondaryCtaLabel: input.secondaryCtaLabel ?? null,
    secondaryCtaHref: input.secondaryCtaHref ?? null,
    startAt: input.startAt ?? null,
    endAt: input.endAt ?? null,
    video: input.video ?? null,
    stats: normalizeStats(input.stats),
    countdownLabel: input.countdownLabel ?? null,
    countdownTargetAt: input.countdownTargetAt ?? null,
    updatedAt: new Date().toISOString(),
  }

  store.slides = normalizeSortOrder(store.slides)
  await writeStore(store)

  const saved = store.slides.find((item) => item.id === id)!
  return toListItem(saved)
}

export async function deleteHeroSlide(id: string) {
  const store = await readStore()
  const nextSlides = store.slides.filter((slide) => slide.id !== id)
  if (nextSlides.length === store.slides.length) return false
  store.slides = normalizeSortOrder(nextSlides)
  await writeStore(store)
  return true
}

export async function reorderHeroSlides(ids: string[]) {
  const store = await readStore()
  const byId = new Map(store.slides.map((slide) => [slide.id, slide]))
  const ordered: HeroSlide[] = []

  ids.forEach((id) => {
    const slide = byId.get(id)
    if (slide) {
      ordered.push(slide)
      byId.delete(id)
    }
  })

  for (const slide of sortSlides(Array.from(byId.values()))) {
    ordered.push(slide)
  }

  store.slides = ordered.map((slide, index) => ({
    ...slide,
    sortOrder: index,
    updatedAt: new Date().toISOString(),
  }))

  await writeStore(store)
  return store.slides.map(toListItem)
}

export async function listPublicHeroSlides(locale?: string | null) {
  const slides = await listHeroSlides({
    includeArchived: false,
    locale: locale ?? null,
    status: 'published',
  })

  return slides.filter((slide) => slide.isActive && slide.isScheduledNow)
}
