'use client'

import { useCallback } from 'react'
import { Card, Col, Row, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi } from '@/hooks/useApi'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipDashboardContent() {
  const reportFn = useCallback(() => membershipCampaignApi.getReports(), [])
  const applicationsFn = useCallback(() => membershipCampaignApi.listApplications({ page: 1, limit: 5 }), [])
  const membershipsFn = useCallback(() => membershipCampaignApi.listMemberships({ page: 1, limit: 5 }), [])
  const upgradesFn = useCallback(() => membershipCampaignApi.listUpgrades({ page: 1, limit: 5 }), [])
  const { data: reports, loading, error } = useApi(reportFn, [])
  const { data: applications } = useApi(applicationsFn, [])
  const { data: memberships } = useApi(membershipsFn, [])
  const { data: upgrades } = useApi(upgradesFn, [])

  const cards = [
    { label: 'Campaigns', value: reports?.campaigns ?? 0 },
    { label: 'Applications', value: reports?.applicationsByStatus.reduce((sum, item) => sum + item._count._all, 0) ?? 0 },
    { label: 'Active Members', value: reports?.membershipsByStatus.find((item) => item.membershipRecordStatus === 'active')?._count._all ?? 0 },
    { label: 'Upgrade Records', value: reports?.upgradesByStatus.reduce((sum, item) => sum + item._count._all, 0) ?? 0 },
  ]

  return (
    <div className="container-fluid">
      <PageHeader title="Membership Management Dashboard" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Dashboard' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        <Row className="g-3 mb-3">
          {cards.map((card) => (
            <Col md={3} key={card.label}>
              <Card>
                <Card.Body>
                  <div className="text-muted small">{card.label}</div>
                  <h3 className="mb-0">{card.value}</h3>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row className="g-3">
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Recent Applications</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications?.data?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.applicantName}</td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Recent Members</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships?.data?.map((item: any) => (
                      <tr key={item.id}>
                        <td>{item.membershipNumber ?? item.cardNumber ?? item.id}</td>
                        <td>
                          <StatusBadge status={item.membershipRecordStatus ?? item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Recent Upgrades</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>To Plan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upgrades?.data?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.toPlan?.code ?? '-'}</td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </LoadingOverlay>
    </div>
  )
}
