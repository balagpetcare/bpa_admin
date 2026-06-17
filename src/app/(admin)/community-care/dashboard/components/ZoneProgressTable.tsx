import { Card, Table, ProgressBar } from 'react-bootstrap'
import Link from 'next/link'
import type { CareFundZoneStat } from '@/types/bpa.types'

interface Props {
  zones: CareFundZoneStat[]
}

export default function ZoneProgressTable({ zones }: Props) {
  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between">
        <span className="fw-semibold">Zone Progress</span>
        <Link href="/community-care/zones" className="btn btn-soft-primary btn-sm">View All</Link>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Zone</th>
              <th>Contributors</th>
              <th>Care Partner Members</th>
              <th style={{ minWidth: 120 }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-muted">No zones yet</td></tr>
            ) : zones.map((z) => (
              <tr key={z.id}>
                <td>
                  <div className="fw-semibold">{z.name}</div>
                  <div className="text-muted small">{z.slug}</div>
                </td>
                <td>
                  <div className="small">{z.currentContributors} / {z.targetContributors}</div>
                </td>
                <td>
                  <div className="small fw-semibold">{z.carePartnerMembers ?? 0}</div>
                </td>
                <td>
                  <ProgressBar
                    now={Math.min(z.progressPercent, 100)}
                    label={`${Math.round(z.progressPercent)}%`}
                    variant={z.progressPercent >= 100 ? 'success' : z.progressPercent >= 50 ? 'info' : 'warning'}
                    style={{ height: 8 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
