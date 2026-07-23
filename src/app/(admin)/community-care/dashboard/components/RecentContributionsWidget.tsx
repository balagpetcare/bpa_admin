import { Card, Table, Badge } from 'react-bootstrap'
import Link from 'next/link'
import type { RecentContributionItem } from '@/types/bpa.types'

const STATUS_VARIANTS: Record<string, string> = {
  paid: 'success',
  pending_payment: 'warning',
  cancelled: 'secondary',
  refunded: 'danger',
}

interface Props {
  contributions: RecentContributionItem[]
}

export default function RecentContributionsWidget({ contributions }: Props) {
  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between">
        <span className="fw-semibold">Recent Contributors</span>
        <Link href="/community-care/contributors" className="btn btn-soft-primary btn-sm">
          View All
        </Link>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Contributor</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  No contributions yet
                </td>
              </tr>
            ) : (
              contributions.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="fw-semibold small">{c.contributorName ?? 'Anonymous'}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {c.zoneName}
                    </div>
                  </td>
                  <td className="small">৳{Number(c.amountBdt).toLocaleString()}</td>
                  <td>
                    <Badge
                      bg={`${STATUS_VARIANTS[c.status] ?? 'secondary'}-subtle`}
                      text={STATUS_VARIANTS[c.status] ?? 'secondary'}
                      className="text-capitalize">
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
