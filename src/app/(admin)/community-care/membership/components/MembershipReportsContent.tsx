'use client'

import { useCallback } from 'react'
import { Card, Col, Row, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipReportsContent() {
  const fetchFn = useCallback(() => membershipCampaignApi.getReports(), [])
  const { data, loading, error } = useApi(fetchFn, [])
  return (
    <div className="container-fluid">
      <PageHeader title="Reports" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Reports' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        <Row className="g-3">
          <Col lg={4}><Card><Card.Body><div className="text-muted small">Campaigns</div><h3 className="mb-0">{data?.campaigns ?? 0}</h3></Card.Body></Card></Col>
          <Col lg={4}><Card><Card.Body><div className="text-muted small">Applications</div><h3 className="mb-0">{data?.applicationsByStatus.reduce((sum, item) => sum + item._count._all, 0) ?? 0}</h3></Card.Body></Card></Col>
          <Col lg={4}><Card><Card.Body><div className="text-muted small">Memberships</div><h3 className="mb-0">{data?.membershipsByStatus.reduce((sum, item) => sum + item._count._all, 0) ?? 0}</h3></Card.Body></Card></Col>
        </Row>
        <Row className="g-3 mt-1">
          <Col lg={4}><Card><Card.Header><h5 className="mb-0">Applications by Status</h5></Card.Header><Card.Body className="p-0"><Table className="mb-0"><tbody>{data?.applicationsByStatus.map((item) => <tr key={item.status}><td>{item.status}</td><td className="text-end">{item._count._all}</td></tr>)}</tbody></Table></Card.Body></Card></Col>
          <Col lg={4}><Card><Card.Header><h5 className="mb-0">Memberships by Status</h5></Card.Header><Card.Body className="p-0"><Table className="mb-0"><tbody>{data?.membershipsByStatus.map((item) => <tr key={item.membershipRecordStatus}><td>{item.membershipRecordStatus}</td><td className="text-end">{item._count._all}</td></tr>)}</tbody></Table></Card.Body></Card></Col>
          <Col lg={4}><Card><Card.Header><h5 className="mb-0">Upgrades by Status</h5></Card.Header><Card.Body className="p-0"><Table className="mb-0"><tbody>{data?.upgradesByStatus.map((item) => <tr key={item.status}><td>{item.status}</td><td className="text-end">{item._count._all}</td></tr>)}</tbody></Table></Card.Body></Card></Col>
        </Row>
      </LoadingOverlay>
    </div>
  )
}
