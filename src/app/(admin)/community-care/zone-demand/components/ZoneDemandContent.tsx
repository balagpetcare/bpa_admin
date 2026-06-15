'use client'

import { Card, Table, ProgressBar, Badge, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { communityZonesApi } from '@/lib/api/community-zones.api'
import type { ApiError } from '@/lib/api'
import type { ZoneDemandRanking } from '@/types/bpa.types'

const CLINIC_STATUS_COLORS: Record<string, string> = {
  planned: 'secondary',
  priority: 'warning',
  in_progress: 'info',
  active: 'success',
  paused: 'danger',
}

export default function ZoneDemandContent() {
  const { data: zones, loading, error } = useApi(() => communityZonesApi.getDemandRanking(), [])

  const handleExportCsv = () => {
    if (!zones || zones.length === 0) return

    const headers = [
      'Rank', 'Zone Name', 'Clinic Status', 'Target Members', 'Paid Members', 
      'Active Cards', 'Pending Purchases', 'Progress %', 'Revenue (BDT)', 
      'Priority Score', 'Last Purchase'
    ]
    
    const rows = zones.map((z: ZoneDemandRanking, i: number) => [
      i + 1,
      z.name,
      z.clinicStatus,
      z.targetMembers,
      z.paidPurchases,
      z.activeCards,
      z.pendingPurchases,
      ((z.paidPurchases / z.targetMembers) * 100).toFixed(1),
      z.revenueAmount,
      z.priorityScore,
      z.lastPurchaseDate ? new Date(z.lastPurchaseDate).toLocaleDateString() : 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `zone-demand-ranking-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Zone Demand Ranking"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Zone Demand' }]}
        action={
          <Button variant="outline-primary" onClick={handleExportCsv} disabled={loading || !zones?.length}>
            <Icon icon="solar:export-bold" className="me-1" /> Export CSV
          </Button>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Header className="bg-light-subtle py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Demand Ranking & Clinic Priority</h5>
            <small className="text-muted">Ranked by Priority Score (Active Cards x10 + Paid x5 + Pending x1)</small>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table responsive hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3" style={{ width: '60px' }}>Rank</th>
                  <th>Zone Name</th>
                  <th>Clinic Status</th>
                  <th className="text-center">Paid / Target</th>
                  <th style={{ width: '150px' }}>Progress</th>
                  <th className="text-center">Active Cards</th>
                  <th className="text-center">Pending</th>
                  <th className="text-end">Revenue</th>
                  <th className="text-center">Score</th>
                  <th className="pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones?.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-muted">No zones found</td></tr>
                ) : zones?.map((z: ZoneDemandRanking, i: number) => {
                  const progress = Math.min(100, (z.paidPurchases / z.targetMembers) * 100)
                  return (
                    <tr key={z.id}>
                      <td className="ps-3 font-weight-bold">
                        {i < 3 ? (
                          <Badge bg={i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze'} className={`rank-badge rank-${i + 1}`}>
                            {i + 1}
                          </Badge>
                        ) : (
                          <span className="text-muted ms-2">{i + 1}</span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{z.name}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                          {z.description || 'No description'}
                        </div>
                      </td>
                      <td>
                        <Badge bg={CLINIC_STATUS_COLORS[z.clinicStatus] || 'secondary'} className="text-capitalize">
                          {z.clinicStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <span className="fw-medium">{z.paidPurchases}</span>
                        <span className="text-muted small"> / {z.targetMembers}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar now={progress} variant={progress >= 100 ? 'success' : progress >= 50 ? 'primary' : 'warning'} style={{ height: '6px', flex: 1 }} />
                          <small className="fw-bold" style={{ minWidth: '35px' }}>{progress.toFixed(0)}%</small>
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg="success-subtle" text="success" className="fs-6">
                          {z.activeCards}
                        </Badge>
                      </td>
                      <td className="text-center text-muted">
                        {z.pendingPurchases}
                      </td>
                      <td className="text-end fw-medium">
                        ৳{Number(z.revenueAmount).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <div className="bg-light rounded px-2 py-1 fw-bold text-primary">
                          {z.priorityScore}
                        </div>
                      </td>
                      <td className="pe-3 text-end">
                        <Link href={`/community-care/zones/${z.id}`} className="btn btn-sm btn-soft-primary">
                          <Icon icon="solar:pen-bold" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      <style jsx>{`
        .rank-badge {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          padding: 0;
          font-size: 12px;
        }
        :global(.bg-gold) { background-color: #FFD700 !important; color: #000 !important; }
        :global(.bg-silver) { background-color: #C0C0C0 !important; color: #000 !important; }
        :global(.bg-bronze) { background-color: #CD7F32 !important; color: #fff !important; }
      `}</style>
    </div>
  )
}
