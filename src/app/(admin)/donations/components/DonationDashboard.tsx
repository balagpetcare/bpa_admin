'use client'

import { useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useApi } from '@/hooks/useApi'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import type { ApiError } from '@/lib/api'
import { getDashboardStats } from '@/lib/api/donations.api'
import DonationKpiCards from './DonationKpiCards'
import DonationCharts from './DonationCharts'

export default function DonationDashboard() {
  const fn = useCallback(() => getDashboardStats(), [])
  const { data: stats, loading, error } = useApi(fn, [])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Donation Dashboard"
        breadcrumbs={[{ label: 'Donations' }, { label: 'Dashboard' }]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <DonationKpiCards stats={stats} loading={loading} />
      {stats && <DonationCharts stats={stats} />}
    </div>
  )
}
