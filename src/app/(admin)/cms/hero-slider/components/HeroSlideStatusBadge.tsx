'use client'

import { Badge } from 'react-bootstrap'
import type { HeroSlideStatus } from '@/types/bpa.types'

const MAP: Record<HeroSlideStatus, { bg: string; text: string }> = {
  draft: { bg: 'secondary-subtle', text: 'secondary' },
  published: { bg: 'success-subtle', text: 'success' },
  archived: { bg: 'dark-subtle', text: 'dark' },
}

export default function HeroSlideStatusBadge({ status }: { status: HeroSlideStatus }) {
  const style = MAP[status]
  return (
    <Badge bg={style.bg} text={style.text}>
      {status}
    </Badge>
  )
}
