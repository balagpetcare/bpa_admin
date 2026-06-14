# Hero Slider Frontend Report

## Scope

Implemented the public homepage hero slider frontend on top of the Hero Slider CMS and existing backend/public API work.

## Files Updated

- `src/app/page.tsx`
- `src/components/home/HeroSliderServer.tsx`
- `src/components/home/HeroSliderClient.tsx`
- `src/components/home/HeroSliderSkeleton.tsx`
- `src/components/home/HeroSliderEmptyState.tsx`
- `src/components/home/HeroCountdown.tsx`
- `src/assets/scss/pages/_landing-hero.scss`
- `src/assets/scss/app.scss`
- `src/types/bpa.types.ts`
- `src/lib/api/hero-slider.api.ts`
- `src/server/hero-slider/schema.ts`
- `src/server/hero-slider/store.ts`
- `src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx`
- `src/app/(admin)/cms/hero-slider/components/HeroSliderListContent.tsx`
- `src/app/(admin)/cms/hero-slider/components/HeroSlidePreviewCard.tsx`

## Implemented Frontend Features

- Full-width responsive homepage hero shell.
- Server-rendered homepage hero entry for SEO-safe output.
- Swiper-powered multi-slide client experience with:
  - auto rotation
  - manual navigation
  - keyboard navigation
  - touch swipe
  - pagination
- Desktop image and mobile image support via `<picture>`.
- Optional background video support with poster-style image fallback.
- Lazy loading for non-initial slides.
- Loading skeleton for suspense fallback.
- No-slide fallback state when no active hero slides exist.
- Accessibility support:
  - semantic heading structure
  - keyboard navigation
  - screen-reader labels
  - live countdown updates
  - accessible nav/pagination text
- UI support for:
  - headline
  - subheadline
  - primary CTA
  - secondary CTA
  - optional badge
  - optional campaign tag
  - optional statistics
  - optional campaign countdown

## CMS/Data Model Support Added For Frontend

- Badge text.
- Campaign tag.
- Secondary CTA fields.
- Statistics collection.
- Countdown label and target date.
- Backward-compatible normalization for legacy slide data.

## Performance Notes

- First paint remains server-rendered for SEO and fallback safety.
- Initial hero height is reserved in CSS to reduce layout shift.
- Non-primary hero media is lazy loaded.
- Mobile image source is separate from desktop media.
- Video is optional and muted/looping background-only.
- Implementation avoids requiring remote `next/image` configuration for CMS-hosted assets.

## Validation

### Passed

- `npx tsc --noEmit`
- `npx eslint src/app/page.tsx src/components/home src/app/api/public/hero-slides/route.ts src/lib/api/hero-slider.api.ts src/server/hero-slider/schema.ts src/server/hero-slider/store.ts 'src/app/(admin)/cms/hero-slider' --ext .ts,.tsx`
- `npm run build`

### Repo-wide lint status

- `npm run lint` still fails at repository scope.
- Failures are pre-existing and unrelated to the hero slider work.
- Representative unrelated failures include:
  - `src/app/(admin)/advanced-ul/sweet-alert/components/AllSweetAlerts.tsx`
  - `src/app/(admin)/apps/chat/components/ChatLeftSidebar.tsx`
  - `src/context/useLayoutContext.tsx`
  - multiple legacy chart/demo files

## Runtime Verification

### Public API

- Verified `http://localhost:3005/api/public/hero-slides?locale=en`
- Result: `{"success":true,"data":[]}`

### Homepage Rendering

- Verified `http://localhost:3005`
- Current local CMS data contains no slides in `data/hero-slides.json`
- Result:
  - homepage returns SEO-safe HTML
  - metadata falls back to:
    - title: `BPA Homepage`
    - description: `BPA community programs, campaigns, and services.`
  - no-slide fallback content is rendered instead of an empty banner

## Risks / Follow-up

- The current local dataset is empty, so live multi-slide motion/video behavior was not exercised with published content in this run.
- Repo-wide lint debt remains and may block teams expecting a fully clean global lint pass.
- If production media URLs come from external domains, future hardening may include a unified image optimization strategy for those origins.
- Countdown content depends on valid scheduled campaign dates from CMS authors.

## Implementation Sequence

1. Extend the hero slide type/contracts for badge, tags, second CTA, stats, and countdown.
2. Expand backend validation and persistence while preserving legacy slide compatibility.
3. Update CMS create/edit/preview flows so editors can manage the full hero content model.
4. Build a server-rendered homepage hero entry point with suspense fallback.
5. Add a client slider layer for autoplay, swipe, keyboard navigation, and progressive media loading.
6. Add responsive styling, reserved layout space, fallback state, and accessible interaction affordances.
7. Run targeted lint, typecheck, build, and runtime verification against the public homepage/API.
