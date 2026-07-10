'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Badge, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { HeroSlideListItem } from '@/types/bpa.types'
import { resolveMediaUrl } from '@/lib/utils/media-url'
import HeroSlideStatusBadge from './HeroSlideStatusBadge'

interface HeroSliderSortableRowProps {
  slide: HeroSlideListItem
  onDelete: (slide: HeroSlideListItem) => void
  onToggleActive: (slide: HeroSlideListItem, isActive: boolean) => void
}

function formatSchedule(startAt: string | null, endAt: string | null) {
  if (!startAt && !endAt) return 'Always on'
  const start = startAt ? new Date(startAt).toLocaleString() : 'Now'
  const end = endAt ? new Date(endAt).toLocaleString() : 'No end'
  return `${start} -> ${end}`
}

export default function HeroSliderSortableRow({ slide, onDelete, onToggleActive }: HeroSliderSortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })
  const previewUrl = resolveMediaUrl(slide.mobileImage?.url)

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      <td className="text-muted" style={{ width: 42 }}>
        <span
          {...attributes}
          {...listeners}
          className="d-inline-flex align-items-center justify-content-center"
          style={{ cursor: 'grab' }}
          aria-label={`Reorder ${slide.title}`}
        >
          <Icon icon="solar:sort-vertical-bold" />
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={slide.mobileImage?.altText ?? slide.title}
              className="rounded border"
              style={{ width: 72, height: 48, objectFit: 'cover' }}
            />
          ) : (
            <div className="rounded border bg-light d-flex align-items-center justify-content-center" style={{ width: 72, height: 48 }}>
              <Icon icon="solar:gallery-minimalistic-bold-duotone" className="text-muted" />
            </div>
          )}
          <div>
            <div className="fw-semibold">{slide.title}</div>
            <div className="small text-muted">{slide.headline}</div>
          </div>
        </div>
      </td>
      <td>
        <Badge bg="primary-subtle" text="primary" className="me-2">{slide.locale.toUpperCase()}</Badge>
        <Badge bg="info-subtle" text="info">{slide.mediaType}</Badge>
      </td>
      <td><HeroSlideStatusBadge status={slide.status} /></td>
      <td>
        <div className="small">{formatSchedule(slide.startAt, slide.endAt)}</div>
        <div className={`small ${slide.isScheduledNow ? 'text-success' : 'text-muted'}`}>
          {slide.isScheduledNow ? 'Visible in current schedule window' : 'Outside current schedule window'}
        </div>
      </td>
      <td>
        <Form.Check
          type="switch"
          id={`slide-active-${slide.id}`}
          label={slide.isActive ? 'Active' : 'Inactive'}
          checked={slide.isActive}
          onChange={(e) => onToggleActive(slide, e.target.checked)}
        />
      </td>
      <td className="text-end">
        <div className="d-flex gap-1 justify-content-end">
          <Link href={`/cms/hero-slider/${slide.id}/edit`} className="btn btn-soft-primary btn-sm">
            <Icon icon="solar:pen-bold" />
          </Link>
          <Button variant="soft-danger" size="sm" onClick={() => onDelete(slide)}>
            <Icon icon="solar:trash-bin-trash-bold" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
