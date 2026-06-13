# Hero Slider Plan

## Objective
Design and implement an enterprise-grade homepage hero slider system for the BPA Landing Page project with responsive public rendering and full admin management, while keeping the implementation SEO-safe and accessible.

## Design Goals
- Multi-slide hero banner with polished editorial presentation.
- Responsive layouts for desktop, tablet, and mobile.
- Support for image slides and video slides.
- CTA buttons per slide with configurable target destinations.
- Flexible overlay content positioning.
- Auto-play with manual navigation controls.
- Touch swipe support on mobile and tablet.
- Strong accessibility and keyboard support.
- SEO-safe rendering and metadata handling.
- Admin-friendly management for create, edit, delete, reorder, activate, deactivate, and schedule.
- Multi-language ready content model.

## Proposed Architecture

### Public presentation layer
Render the hero slider on the homepage using a dedicated public component that receives only active and currently schedulable slides.

Key principles:
- Server-render the first slide or the full slide list when possible.
- Keep critical headline and CTA content in HTML, not only in client state.
- Use image fallbacks for video slides.
- Respect reduced-motion preferences and provide pause controls.
- Keep navigation accessible with buttons, dots, and keyboard interaction.

### Admin content layer
Create a dedicated CMS section for hero slides with:
- listing and filtering
- create/edit/delete forms
- drag-and-drop ordering
- activation toggles
- scheduled start and end dates
- desktop and mobile image upload
- optional video upload
- CTA target configuration
- locale-aware fields

### Data and API layer
Add a hero slider API and domain model rather than overloading campaigns or media roles.

Recommended capabilities:
- `GET` list of slides
- `GET` single slide
- `POST` create slide
- `PATCH` update slide
- `DELETE` remove slide
- `PATCH` reorder slides
- `PATCH` activate/deactivate slide
- `PATCH` update scheduling
- media upload endpoints for desktop image, mobile image, and optional video

## Implementation Sequence

### Phase 1: Domain and contract design
1. Define the slide entity, slide status rules, scheduling precedence, and locale strategy.
2. Add TypeScript types for the hero slide model in [`src/types/bpa.types.ts`](../../src/types/bpa.types.ts).
3. Add a new API client in [`src/lib/api/hero-slider.api.ts`](../../src/lib/api/hero-slider.api.ts).
4. Confirm how slide media links to the existing media system in [`src/lib/api/media.api.ts`](../../src/lib/api/media.api.ts).

### Phase 2: Admin CRUD foundation
1. Create the admin page shell in [`src/app/(admin)/cms/hero-slider/page.tsx`](../../src/app/(admin)/cms/hero-slider/page.tsx).
2. Build list, search, and action controls in [`src/app/(admin)/cms/hero-slider/components/HeroSliderList.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderList.tsx).
3. Build the create/edit form in [`src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx).
4. Reuse the existing Flatpickr pattern for `startAt` and `endAt`.

### Phase 3: Ordering and lifecycle
1. Add drag-and-drop ordering using the same pattern as the committee table in [`src/app/(admin)/cms/committee/components/CommitteeTable.tsx`](../../src/app/(admin)/cms/committee/components/CommitteeTable.tsx).
2. Add optimistic reorder persistence.
3. Add activate/deactivate actions and ensure the active state is visible in the list.
4. Define how scheduled slides behave when they are active but outside the date window.

### Phase 4: Media handling
1. Extend media selection so slides can attach a desktop image, mobile image, and optional video.
2. Prefer reusing the media picker and upload flow from [`src/components/ui/MediaPickerInput.tsx`](../../src/components/ui/MediaPickerInput.tsx) and [`src/components/form/DropzoneFormInput.tsx`](../../src/components/form/DropzoneFormInput.tsx).
3. Add file-type validation for image and video assets.
4. Add preview states for still image, desktop/mobile variants, and video poster fallback.

### Phase 5: Public hero slider
1. Replace the root redirect strategy with a real public homepage in [`src/app/page.tsx`](../../src/app/page.tsx) or route the landing page to a dedicated public route if the product keeps `/dashboard` separate.
2. Build the hero slider component in [`src/components/home/HeroSlider.tsx`](../../src/components/home/HeroSlider.tsx).
3. Render semantic headline, description, and CTA content directly in the HTML.
4. Add autoplay, swipe, navigation, pagination, and pause/resume controls.
5. Support responsive image selection and video fallback behavior.

### Phase 6: SEO, accessibility, and verification
1. Ensure the first slide content is crawlable and not hidden behind client-only interaction.
2. Add image alt text, accessible CTA labels, and focus-visible controls.
3. Implement reduced-motion behavior and pause controls.
4. Wire the homepage into existing SEO metadata flows using [`src/lib/api/seo.api.ts`](../../src/lib/api/seo.api.ts).
5. Validate the result on desktop, tablet, and mobile viewports.

## File Path Plan

### Existing files to reuse
- [`src/app/page.tsx`](../../src/app/page.tsx)
- [`src/app/layout.tsx`](../../src/app/layout.tsx)
- [`src/components/CustomFlatpickr.tsx`](../../src/components/CustomFlatpickr.tsx)
- [`src/components/ui/MediaPickerInput.tsx`](../../src/components/ui/MediaPickerInput.tsx)
- [`src/lib/api/media.api.ts`](../../src/lib/api/media.api.ts)
- [`src/lib/api/campaigns.api.ts`](../../src/lib/api/campaigns.api.ts)
- [`src/lib/api/seo.api.ts`](../../src/lib/api/seo.api.ts)
- [`src/types/bpa.types.ts`](../../src/types/bpa.types.ts)

### New public files
- [`src/components/home/HeroSlider.tsx`](../../src/components/home/HeroSlider.tsx)
- [`src/components/home/HeroSlide.tsx`](../../src/components/home/HeroSlide.tsx)
- [`src/components/home/HeroSliderControls.tsx`](../../src/components/home/HeroSliderControls.tsx)

### New admin files
- [`src/app/(admin)/cms/hero-slider/page.tsx`](../../src/app/(admin)/cms/hero-slider/page.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSliderList.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderList.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSliderSortableTable.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSliderSortableTable.tsx)
- [`src/app/(admin)/cms/hero-slider/components/HeroSlideMediaFields.tsx`](../../src/app/(admin)/cms/hero-slider/components/HeroSlideMediaFields.tsx)

### New API files
- [`src/lib/api/hero-slider.api.ts`](../../src/lib/api/hero-slider.api.ts)

## Risks

1. Public homepage scope conflict
   - The app currently redirects `/` to `/dashboard`, so introducing a true homepage may affect existing navigation expectations.

2. SEO regression risk
   - A client-only slider can weaken crawlability and first-contentful paint if the hero content is not server-rendered.

3. Media handling complexity
   - Supporting both image and video slides increases upload validation, preview logic, and storage rules.

4. Mobile performance risk
   - Large hero assets and autoplay video can hurt performance on low-bandwidth devices if variants and fallbacks are not enforced.

5. Accessibility risk
   - Auto-rotating content without pause, keyboard access, or reduced-motion handling can fail accessibility expectations.

6. Scheduling ambiguity
   - Overlapping rules for active, scheduled, and hidden states can create inconsistent frontend output unless precedence is documented and enforced.

7. Localization debt
   - Multi-language readiness should be designed into the data model early; retrofitting it later is expensive.

## Acceptance Criteria
- The homepage can render multiple hero slides responsively.
- Slides support images, optional videos, and per-slide CTAs.
- Autoplay, manual navigation, and swipe all work.
- The first visible slide is SEO-safe and accessible.
- Admin users can create, edit, delete, reorder, activate, deactivate, and schedule slides.
- Desktop image, mobile image, and optional video uploads are supported.
- The implementation is ready for multi-language expansion.

## Recommendation
Do not extend the existing campaign media model for this feature. The hero slider deserves its own content entity, its own admin screens, and its own public rendering component so it can evolve independently without coupling homepage marketing content to campaign workflows.
