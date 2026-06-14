'use client'

import { Badge } from 'react-bootstrap'
import type { NewsStatus } from '@/types/bpa.types'

const MAP: Record<NewsStatus, { bg: string; label: string }> = {
  draft:     { bg: 'secondary', label: 'Draft' },
  published: { bg: 'success',   label: 'Published' },
  archived:  { bg: 'dark',      label: 'Archived' },
}

export default function NewsStatusBadge({ status }: { status: NewsStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
