'use client'

import Link from 'next/link'
import { Card, Badge } from 'react-bootstrap'
import type { NewsListItem } from '@/types/bpa.types'

export default function RecentNewsWidget({ items }: { items: NewsListItem[] }) {
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent News</h5>
        <Link href="/cms/news" className="text-muted small">View all →</Link>
      </Card.Header>
      <Card.Body className="p-0">
        {items.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No news articles yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((n) => (
              <li key={n.id} className="list-group-item px-3 py-2">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 overflow-hidden">
                    <Link href={`/cms/news/${n.id}`} className="text-dark fw-semibold text-truncate d-block small">
                      {n.title}
                    </Link>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge bg={n.status === 'published' ? 'success' : n.status === 'archived' ? 'dark' : 'secondary'} className="flex-shrink-0">
                    {n.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  )
}
