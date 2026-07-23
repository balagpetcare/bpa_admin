'use client'

import { useCallback, useState } from 'react'
import { Row, Col, Button, Dropdown, ButtonGroup, Alert, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useApi } from '@/hooks/useApi'
import PageHeader from '@/components/ui/PageHeader'
import { getDashboardStats, exportDonationsCsv } from '@/lib/api/donations.api'
import DonationKpiCards from './DonationKpiCards'
import DonationCharts from './DonationCharts'
import RecentDonationsTable from './RecentDonationsTable'
import PendingActionsPanel from './PendingActionsPanel'
import TransparencyImpactPanel from './TransparencyImpactPanel'
import EmptyDashboardState from './EmptyDashboardState'

export default function DonationDashboard() {
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'year'>('all')
  const [isExporting, setIsExporting] = useState(false)

  const fetchStats = useCallback(() => getDashboardStats(), [])
  const { data: stats, loading, error, refetch } = useApi(fetchStats, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportDonationsCsv()
    } catch (err) {
      alert('Failed to export CSV: ' + String(err))
    } finally {
      setIsExporting(false)
    }
  }

  // Determine if database is empty
  const isEmpty = stats && stats.totalDonations === 0

  return (
    <div className="container-fluid py-3">
      {/* Dashboard Top Header Action Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <PageHeader title="Care Fund Dashboard" breadcrumbs={[{ label: 'Donations' }, { label: 'Dashboard' }]} />
          <p className="text-muted small mb-0 mt-n2">
            Monitor donations, manual transfer verification requests, campaigns, and transparency reports.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Date Filter Selection */}
          <Dropdown as={ButtonGroup}>
            <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
              <Icon icon="solar:calendar-bold-duotone" />
              <span>{dateFilter === 'all' ? 'All Time' : dateFilter === 'month' ? 'This Month' : 'This Year'}</span>
            </Button>
            <Dropdown.Toggle split variant="outline-secondary" size="sm" />
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => setDateFilter('all')} active={dateFilter === 'all'}>
                All Time
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setDateFilter('month')} active={dateFilter === 'month'}>
                This Month
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setDateFilter('year')} active={dateFilter === 'year'}>
                This Year
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Refresh Action */}
          <Button
            variant="light"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="d-flex align-items-center gap-1 border border-secondary-subtle"
            title="Refresh statistics">
            <Icon icon="solar:refresh-bold-duotone" className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </Button>

          {/* Export Action */}
          <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting || loading} className="d-flex align-items-center gap-1">
            {isExporting ? <Spinner animation="border" size="sm" /> : <Icon icon="solar:download-bold-duotone" />}
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="danger" className="d-flex flex-column gap-2 p-3 border-danger shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2">
            <Icon icon="solar:danger-bold-duotone" className="fs-24 text-danger" />
            <h5 className="mb-0 fw-bold">Failed to load donation stats</h5>
          </div>
          <p className="mb-0 text-dark-emphasis small">{error.message || 'An unknown network error occurred while contacting the server.'}</p>
          <div className="text-muted fs-11">
            <strong>Endpoint:</strong> /api/v1/admin/donations/dashboard-stats • <strong>Code:</strong> {error.code || 'UNKNOWN'}
          </div>
          <div>
            <Button variant="danger" size="sm" onClick={refetch} className="px-4 mt-2">
              Retry Connection
            </Button>
          </div>
        </Alert>
      )}

      {/* Empty State vs Real Data */}
      {isEmpty ? (
        <EmptyDashboardState />
      ) : (
        <>
          {/* KPI Cards section */}
          <DonationKpiCards stats={stats} loading={loading} />

          {stats && (
            <>
              {/* Charts section */}
              <DonationCharts stats={stats} />

              {/* Transactions & Tasks Grid */}
              <Row className="g-3 mb-4">
                <Col xs={12} xl={8}>
                  <RecentDonationsTable donations={stats.recentDonations ?? []} />
                </Col>
                <Col xs={12} xl={4}>
                  <PendingActionsPanel
                    pendingReviewCount={stats.pendingDonations}
                    failedCount={stats.failedDonations}
                    recentPendingReview={(stats.recentDonations ?? []).filter((d) => d.status === 'pending_review')}
                  />
                </Col>
              </Row>

              {/* Impact summary details */}
              <Row className="g-3 mb-4">
                <Col xs={12} xl={6}>
                  <TransparencyImpactPanel data={stats.transparencySummary} />
                </Col>
              </Row>
            </>
          )}
        </>
      )}
    </div>
  )
}
