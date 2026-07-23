'use client'

import Link from 'next/link'
import { Card, Badge } from 'react-bootstrap'
import type { ContactSubmission } from '@/types/bpa.types'

export default function RecentContactsWidget({ items }: { items: ContactSubmission[] }) {
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent Contacts</h5>
        <Link href="/contacts" className="text-muted small">
          View all →
        </Link>
      </Card.Header>
      <Card.Body className="p-0">
        {items.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No unread messages.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((c) => (
              <li key={c.id} className="list-group-item px-3 py-2">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 overflow-hidden">
                    <span className="fw-semibold small d-block text-truncate">{c.name}</span>
                    <span className="text-muted text-truncate d-block" style={{ fontSize: 11 }}>
                      {c.subject ?? c.message.slice(0, 50)}
                    </span>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <Badge bg={c.status === 'unread' ? 'danger' : c.status === 'replied' ? 'success' : 'secondary'}>{c.status}</Badge>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
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
