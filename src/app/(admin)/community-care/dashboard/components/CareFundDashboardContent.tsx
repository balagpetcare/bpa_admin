'use client'

import { useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CareFundKpiCards from './CareFundKpiCards'
import ZoneProgressTable from './ZoneProgressTable'
import RecentContributionsWidget from './RecentContributionsWidget'
import { useApi } from '@/hooks/useApi'
import { communityFundApi } from '@/lib/api/community-fund.api'
import type { ApiError } from '@/lib/api'

export default function CareFundDashboardContent() {
  const fetchFn = useCallback(() => communityFundApi.getDashboard(), [])
  const { data, loading, error } = useApi(fetchFn, [])

  return (
    <div className="container-fluid">
      <PageHeader title="Community Care Fund" breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Dashboard' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {data && (
          <>
            <CareFundKpiCards data={data} />
            <Row className="g-3 mt-1">
              <Col xl={7}>
                <ZoneProgressTable zones={data.zones} />
              </Col>
              <Col xl={5}>
                <RecentContributionsWidget contributions={data.recentContributions} />
              </Col>
            </Row>
          </>
        )}
      </LoadingOverlay>
    </div>
  )
}
