'use client'

import { Card, Table } from 'react-bootstrap'
import type { TrafficPoint } from '@/lib/api/analytics.api'

export default function TopPagesTable({ data, loading }: { data: TrafficPoint[]; loading: boolean }) {
  const sorted = [...data].sort((a, b) => b.pageViews - a.pageViews).slice(0, 10)
  const maxViews = sorted[0]?.pageViews ?? 1

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Top Traffic Days</h5>
      </Card.Header>
      <Card.Body className="p-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            <div className="spinner-border text-primary" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No data available.</p>
        ) : (
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Page Views</th>
                  <th>Unique Visitors</th>
                  <th style={{ width: 150 }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.date}>
                    <td>{new Date(row.date).toLocaleDateString()}</td>
                    <td>{row.pageViews.toLocaleString()}</td>
                    <td>{row.uniqueVisitors.toLocaleString()}</td>
                    <td>
                      <div className="progress" style={{ height: 6 }}>
                        <div className="progress-bar bg-primary" style={{ width: `${(row.pageViews / maxViews) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
