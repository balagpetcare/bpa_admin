# Hero Slider Audit

## Scope
This audit evaluates the BPA Landing Page admin panel for an enterprise-grade homepage hero slider system that supports image and video slides, responsive rendering, slide scheduling, manual controls, touch interaction, accessibility, SEO safety, and full admin CRUD management.

## Current Repository State
The current app root does not render a public homepage. The root route immediately redirects to `/dashboard`, so there is no existing public hero surface to extend.

- [`src/app/page.tsx`](../../src/app/page.tsx)
- [`src/app/layout.tsx`](../../src/app/layout.tsx)

The codebase already contains several strong building blocks that should be reused instead of rebuilt:

- Swiper is already installed and demonstrated in admin examples.
- Bootstrap and React Bootstrap are already part of the UI stack.
- Drag-and-drop reordering is already implemented with `@dnd-kit`.
- Scheduled publishing already exists in other CMS flows.
- Media upload and media library patterns already exist.
- SEO metadata CRUD already exists as a reusable admin API surface.

## Relevant Existing Patterns

### Slider and carousel primitives
The repository already includes Swiper demos and Bootstrap carousel examples, which are useful references for interaction patterns, styling, and responsive behavior.

- [`src/app/(admin)/advanced-ul/swiper-slider/AllSwiper.tsx`](../../src/app/(admin)/advanced-ul/swiper-slider/AllSwiper.tsx)
- [`src/app/(admin)/base-ui/carousel/page.tsx`](../../src/app/(admin)/base-ui/carousel/page.tsx)
- [`src/assets/scss/plugins/_swiper.scss`](../../src/assets/scss/plugins/_swiper.scss)

### Media and upload workflow
The project already has a generic media library, upload flow, and campaign-specific media management.

- [`src/components/ui/MediaPickerInput.tsx`](../../src/components/ui/MediaPickerInput.tsx)
- [`src/components/form/DropzoneFormInput.tsx`](../../src/components/form/DropzoneFormInput.tsx)
- [`src/hooks/useFileUploader.ts`](../../src/hooks/useFileUploader.ts)
- [`src/lib/api/media.api.ts`](../../src/lib/api/media.api.ts)
- [`src/lib/api/campaigns.api.ts`](../../src/lib/api/campaigns.api.ts)
- [`src/types/bpa.types.ts`](../../src/types/bpa.types.ts)

### Scheduling and publish state
Date/time entry and publish scheduling patterns already exist and can be adapted for slide start/end dates.

- [`src/components/CustomFlatpickr.tsx`](../../src/components/CustomFlatpickr.tsx)
- [`src/app/(admin)/cms/events/components/EventDateTimePicker.tsx`](../../src/app/(admin)/cms/events/components/EventDateTimePicker.tsx)
- [`src/app/(admin)/cms/news/components/NewsPublishPanel.tsx`](../../src/app/(admin)/cms/news/components/NewsPublishPanel.tsx)
- [`src/app/(admin)/campaigns/components/CampaignForm.tsx`](../../src/app/(admin)/campaigns/components/CampaignForm.tsx)

### Reordering and lifecycle management
The admin panel already demonstrates optimistic drag-and-drop sorting and publish lifecycle actions.

- [`src/app/(admin)/cms/committee/components/CommitteeTable.tsx`](../../src/app/(admin)/cms/committee/components/CommitteeTable.tsx)
- [`src/app/(admin)/campaigns/components/CampaignListContent.tsx`](../../src/app/(admin)/campaigns/components/CampaignListContent.tsx)

### SEO plumbing
SEO metadata is already represented in the domain model and exposed through a dedicated API.

- [`src/lib/api/seo.api.ts`](../../src/lib/api/seo.api.ts)
- [`src/types/bpa.types.ts`](../../src/types/bpa.types.ts)

## Functional Fit Assessment

### Requirements already supported by current stack
- Desktop, tablet, and mobile responsive layouts can be implemented with the existing Bootstrap and Next.js setup.
- Manual navigation is feasible using Swiper or a Bootstrap-style slider implementation.
- Auto-play is already supported by existing Swiper usage.
- Touch swipe support is available through Swiper or Bootstrap carousel touch behavior.
- Accessibility can be handled with semantic buttons, focus management, keyboard support, and reduced-motion awareness.
- SEO-safe delivery is possible with server-rendered first-slide content and crawlable markup.

### Requirements that need new product work
- Multi-slide hero content model with image/video slide variants.
- Per-slide CTA configuration and CTA target selection.
- Slide scheduling with start/end dates.
- Slide activation/deactivation state separate from publish timing.
- Admin CRUD for create/edit/delete.
- Reorder UI and reorder persistence for slides.
- Multi-language fields for title, body copy, CTA text, and alt text.
- Optional desktop and mobile image assets per slide.
- Optional video asset per slide.

## Likely Data Model Gaps
The current domain types do not define a homepage hero slider entity. The closest existing model is campaign media, but that is tied to campaigns and roles such as `hero`, `thumbnail`, `mobile_banner`, and `gallery`, which is not sufficient for a homepage editorial slider.

Expected new fields for a dedicated hero slide model:

- `id`
- `title`
- `eyebrow`
- `headline`
- `body`
- `ctaLabel`
- `ctaHref` or target reference
- `desktopImageId`
- `mobileImageId`
- `videoMediaId`
- `mediaType`
- `isActive`
- `startAt`
- `endAt`
- `sortOrder`
- `locale`
- `createdAt`
- `updatedAt`

## SEO and Accessibility Risks

1. Client-only rendering risk
   - If the hero content is only mounted client-side, crawlers may miss the primary homepage content and the page may feel empty on first paint.

2. Media fallback risk
   - Video slides need an image fallback for browsers that block autoplay, users on data saver modes, and search engines.

3. Motion and autoplay risk
   - Auto-play without pause controls or reduced-motion handling can create accessibility and UX issues.

4. Duplicate content risk
   - Multi-language or multiple CTA variants can create duplicated hero text unless locale scoping and SEO metadata are intentional.

5. Overlapping scheduling rules
   - A slide can be active, scheduled, and published at the same time; the precedence rules must be explicit to avoid inconsistent frontend output.

6. Image performance risk
   - Large desktop hero images can become a major LCP bottleneck if sizes, formats, and preload behavior are not controlled.

7. Admin upload scope risk
   - The existing media picker is image-only, so video support needs a deliberate extension rather than a repurpose of the current picker.

## Recommended File Path Map
These are the most likely files to add or extend during implementation.

### Public homepage
- [`src/app/page.tsx`](../../src/app/page.tsx)
- [`src/components/home/HeroSlider.tsx`](../../src/components/home/HeroSlider.tsx)
- [`src/components/home/HeroSlide.tsx`](../../src/components/home/HeroSlide.tsx)
- [`src/lib/api/hero-slider.api.ts`](../../src/lib/api/hero-slider.api.ts)

### Admin management
- [`src/app/(admin)/cms/hero-slider/page.tsx`](../../src/app/(admin)/cms/hero-slider/page.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSliderList.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderList.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSliderSortableTable.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderSortableTable.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSlideMediaPicker.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSlideMediaPicker.tsx)

### Shared domain and APIs
- [`src/types/bpa.types.ts`](../../src/types/bpa.types.ts)
- [`src/lib/api/hero-slider.api.ts`](../../src/lib/api/hero-slider.api.ts)
- [`src/lib/api/media.api.ts`](../../src/lib/api/media.api.ts)
- [`src/lib/api/seo.api.ts`](../../src/lib/api/seo.api.ts)

## Summary
The repository is already well-positioned for this feature because it has the right UI libraries, media abstractions, scheduling primitives, and drag-and-drop support. The main missing piece is a dedicated homepage hero content domain with separate public rendering and admin CRUD workflows.
