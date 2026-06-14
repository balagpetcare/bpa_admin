'use client'

import Link from 'next/link'
import { Card, Badge } from 'react-bootstrap'
import type { Volunteer } from '@/types/bpa.types'

export default function RecentVolunteersWidget({ items }: { items: Volunteer[] }) {
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Pending Volunteers</h5>
        <Link href="/volunteers?status=pending" className="text-muted small">View all →</Link>
      </Card.Header>
      <Card.Body className="p-0">
        {items.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No pending applications.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((v) => (
              <li key={v.id} className="list-group-item px-3 py-2">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 overflow-hidden">
                    <span className="fw-semibold small d-block">{v.name}</span>
                    <span className="text-muted d-block text-truncate" style={{ fontSize: 11 }}>
                      {v.email}
                    </span>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <Badge bg="warning" text="dark">{v.status}</Badge>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {new Date(v.createdAt).toLocaleDateString()}
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
