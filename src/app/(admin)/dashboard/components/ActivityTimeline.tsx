'use client'

import { Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { NewsListItem, EventListItem, ContactSubmission, Volunteer } from '@/types/bpa.types'

interface TimelineItem {
  icon: string
  color: string
  title: string
  subtitle: string
  date: string
}

function buildTimeline(news: NewsListItem[], events: EventListItem[], contacts: ContactSubmission[], volunteers: Volunteer[]): TimelineItem[] {
  const items: TimelineItem[] = [
    ...news.slice(0, 3).map((n) => ({
      icon: 'solar:document-text-bold-duotone',
      color: 'info',
      title: `News: ${n.title}`,
      subtitle: `Status: ${n.status}`,
      date: n.createdAt,
    })),
    ...events.slice(0, 2).map((e) => ({
      icon: 'solar:calendar-bold-duotone',
      color: 'success',
      title: `Event: ${e.title}`,
      subtitle: `Starts: ${new Date(e.startsAt).toLocaleDateString()}`,
      date: e.createdAt,
    })),
    ...contacts.slice(0, 3).map((c) => ({
      icon: 'solar:letter-bold-duotone',
      color: 'danger',
      title: `Contact from ${c.name}`,
      subtitle: c.subject ?? 'No subject',
      date: c.createdAt,
    })),
    ...volunteers.slice(0, 2).map((v) => ({
      icon: 'solar:hand-heart-bold-duotone',
      color: 'warning',
      title: `Volunteer: ${v.name}`,
      subtitle: v.areaOfInterest ?? 'Application received',
      date: v.createdAt,
    })),
  ]

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
}

interface ActivityTimelineProps {
  news: NewsListItem[]
  events: EventListItem[]
  contacts: ContactSubmission[]
  volunteers: Volunteer[]
}

export default function ActivityTimeline({ news, events, contacts, volunteers }: ActivityTimelineProps) {
  const items = buildTimeline(news, events, contacts, volunteers)

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Recent Activity</h5>
      </Card.Header>
      <Card.Body>
        {items.length === 0 ? (
          <p className="text-muted text-center mb-0">No recent activity.</p>
        ) : (
          <div className="timeline-alt pb-0">
            {items.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <i className={`mdi mdi-circle bg-${item.color}-lighten text-${item.color}`} />
                <div className="timeline-item-info">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon={item.icon} className={`text-${item.color} fs-16`} />
                    <span className="fw-semibold small">{item.title}</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                    {item.subtitle}
                  </p>
                  <span className="text-muted" style={{ fontSize: 11 }}>
                    {new Date(item.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
