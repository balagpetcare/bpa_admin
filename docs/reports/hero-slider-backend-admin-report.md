# Hero Slider Backend + Admin Report

## Scope Delivered
Implemented a full hero slider feature slice inside this Next.js project, covering:

- local backend storage and validation
- admin CRUD API endpoints
- public API endpoint
- admin CMS list/create/edit flows
- drag-and-drop slide ordering
- publish status and schedule controls
- desktop image, mobile image, and optional video support
- media-library reuse with upload support

## What Was Added

### Backend
- File-backed hero slider store at `data/hero-slides.json`
- Validation and scheduling logic under:
  - `src/server/hero-slider/schema.ts`
  - `src/server/hero-slider/store.ts`
- API response helpers:
  - `src/server/api-response.ts`
- Admin API routes:
  - `src/app/api/admin/hero-slides/route.ts`
  - `src/app/api/admin/hero-slides/[id]/route.ts`
  - `src/app/api/admin/hero-slides/reorder/route.ts`
- Public API route:
  - `src/app/api/public/hero-slides/route.ts`

### Shared frontend contract
- Added hero slider domain types to:
  - `src/types/bpa.types.ts`
- Added feature-local API client:
  - `src/lib/api/hero-slider.api.ts`

### Admin CMS
- Added CMS route and pages:
  - `src/app/(admin)/cms/hero-slider/page.tsx`
  - `src/app/(admin)/cms/hero-slider/create/page.tsx`
  - `src/app/(admin)/cms/hero-slider/[id]/edit/page.tsx`
- Added CMS components:
  - `src/app/(admin)/cms/hero-slider/components/HeroSliderListContent.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSliderSortableTable.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSliderSortableRow.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSliderForm.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSliderEditContent.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSlideMediaField.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSlidePreviewCard.tsx`
  - `src/app/(admin)/cms/hero-slider/components/HeroSlideStatusBadge.tsx`

### Reused / extended existing systems
- Extended media picker for image/video filtering and uploads:
  - `src/components/ui/MediaPickerInput.tsx`
- Updated shared Flatpickr wrapper to accept `onChange`:
  - `src/components/CustomFlatpickr.tsx`
- Added menu navigation entry:
  - `src/assets/data/menu-items.ts`

### Tooling
- Added ESLint flat config for Next 16 / ESLint 9 compatibility:
  - `eslint.config.mjs`
- Updated lint script in:
  - `package.json`

## Functional Notes
- Slides support `draft`, `published`, and `archived` status.
- Public visibility requires:
  - `status === published`
  - `isActive === true`
  - current time inside the optional schedule window
- CTA configuration supports:
  - no CTA
  - internal route
  - external URL
- Video slides still require desktop and mobile image fallbacks.
- Media is reused from the existing media library and stored as media snapshots on each slide record.

## Validation and Compatibility
- Payload validation covers required text fields, CTA rules, schedule ordering, and media type matching.
- Existing external API client behavior was left intact.
- Hero slider uses local `/api/...` routes so the new feature does not interfere with the existing remote API setup.

## Verification

### Passed
- `npx tsc --noEmit`
- `npm run build`
- Targeted lint on the new / touched hero slider files:

```powershell
npx eslint eslint.config.mjs src/components/CustomFlatpickr.tsx src/components/ui/MediaPickerInput.tsx src/lib/api/hero-slider.api.ts src/server/api-response.ts src/server/hero-slider/schema.ts src/server/hero-slider/store.ts src/app/api/admin/hero-slides/route.ts src/app/api/admin/hero-slides/reorder/route.ts src/app/api/admin/hero-slides/[id]/route.ts src/app/api/public/hero-slides/route.ts 'src/app/(admin)/cms/hero-slider' --ext .ts,.tsx,.mjs
```

### Repo-wide lint status
- `npm run lint` now executes correctly under Next 16 / ESLint 9, but it still fails because the repository already contains many pre-existing lint errors outside the hero slider scope.
- Those failures are unrelated to this feature and were not mass-fixed here to avoid broad churn in untouched areas.

## Known Limitations
- Persistence is file-backed (`data/hero-slides.json`) rather than database-backed.
- Admin endpoints are structured as local Next API routes and do not yet enforce role/session authorization server-side.
- The homepage rendering itself was not replaced in this task; this work delivers the backend surface and admin CMS needed for that next step.

## Recommended Next Step
Implement the public homepage hero rendering against `/api/public/hero-slides`, then replace the `/` redirect with a real landing page once product confirms the desired public-vs-dashboard route behavior.
