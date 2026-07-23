'use client'

import Link from 'next/link'
import { Card, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { EventListItem } from '@/types/bpa.types'

export default function RecentEventsWidget({ items }: { items: EventListItem[] }) {
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Upcoming Events</h5>
        <Link href="/cms/events" className="text-muted small">
          View all →
        </Link>
      </Card.Header>
      <Card.Body className="p-0">
        {items.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No events found.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((e) => (
              <li key={e.id} className="list-group-item px-3 py-2">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 overflow-hidden">
                    <Link href={`/cms/events/${e.id}`} className="text-dark fw-semibold text-truncate d-block small">
                      {e.title}
                    </Link>
                    <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                      <Icon icon="solar:calendar-bold" />
                      {new Date(e.startsAt).toLocaleDateString()}
                      {e.location && <> · {e.location}</>}
                    </span>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <Badge bg={e.status === 'published' ? 'success' : e.status === 'cancelled' ? 'danger' : 'secondary'}>{e.status}</Badge>
                    {e.capacity !== null && (
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        {e.registrationCount}/{e.capacity}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  )
}
