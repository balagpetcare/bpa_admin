'use client'

import { useState } from 'react'
import { Card, Table, Badge, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { careContributionsApi } from '@/lib/api/care-contributions.api'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import type { CareContribution } from '@/types/bpa.types'

export default function ZoneContributionsTable({ zoneId }: { zoneId: string }) {
  const [page, setPage] = useState(1)
  const { data, loading } = useApi(() => careContributionsApi.list({ zoneId, page, limit: 10 }), [zoneId, page])

  const contributions = data?.data || []
  const meta = data?.meta

  return (
    <Card className="mt-4">
      <Card.Header className="bg-light-subtle py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Contributions in this Zone</h5>
          <Link href={`/community-care/contributors?zoneId=${zoneId}`} className="btn btn-sm btn-soft-primary">
            View All
          </Link>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <LoadingOverlay loading={loading}>
          <Table responsive hover className="table-centered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Contributor</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No contributions found in this zone
                  </td>
                </tr>
              ) : (
                contributions.map((c: CareContribution) => (
                  <tr key={c.id}>
                    <td className="ps-3">
                      <div className="fw-semibold">{c.contributorName}</div>
                      <small className="text-muted">{c.contributorEmail || 'No email'}</small>
                    </td>
                    <td>{c.contributorMobile}</td>
                    <td className="fw-medium">৳{Number(c.amountBdt).toLocaleString()}</td>
                    <td>
                      <Badge bg={c.status === 'paid' ? 'success-subtle' : 'warning-subtle'} text={c.status === 'paid' ? 'success' : 'warning'}>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="pe-3 text-end">
                      <Link href={`/community-care/contributors/${c.id}`} className="btn btn-sm btn-soft-primary">
                        <Icon icon="solar:eye-bold" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {meta && meta.totalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing page {page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  ‹
                </Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                  ›
                </Button>
              </div>
            </div>
          )}
        </LoadingOverlay>
      </Card.Body>
    </Card>
  )
}
