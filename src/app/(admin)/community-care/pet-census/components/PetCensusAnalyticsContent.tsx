'use client'

import { Card, Col, Row, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { petCensusApi } from '@/lib/api/pet-census.api'
import type { ApiError } from '@/lib/api'

function formatPetType(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function PetCensusAnalyticsContent() {
  const { data, loading, error } = useApi(() => petCensusApi.getAnalytics(), [])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Pet Census Analytics"
        breadcrumbs={[
          { label: 'Community Care Fund' },
          { label: 'Pet Census', href: '/community-care/pet-census' },
          { label: 'Analytics' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {data && (
          <>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small">Total Owners</div>
                        <h3 className="mb-0">{data.totals.owners.toLocaleString()}</h3>
                      </div>
                      <div className="avatar-md bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center">
                        <Icon icon="solar:user-bold-duotone" className="fs-3" />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small">Total Pets</div>
                        <h3 className="mb-0">{data.totals.pets.toLocaleString()}</h3>
                      </div>
                      <div className="avatar-md bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center">
                        <Icon icon="solar:cat-bold-duotone" className="fs-3" />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small">Vaccination Needed</div>
                        <h3 className="mb-0">{data.totals.vaccinationNeeded.toLocaleString()}</h3>
                      </div>
                      <div className="avatar-md bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center">
                        <Icon icon="solar:shield-warning-bold-duotone" className="fs-3" />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3">
              <Col lg={7}>
                <Card>
                  <Card.Header className="fw-semibold">District-wise Coverage</Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className="table-centered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Division</th>
                          <th>District</th>
                          <th>Owners</th>
                          <th>Pets</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.districtWise.slice(0, 15).map((row) => (
                          <tr key={`${row.division}-${row.district}`}>
                            <td>{row.division}</td>
                            <td>{row.district}</td>
                            <td>{row.ownerCount}</td>
                            <td>{row.petCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="mb-3">
                  <Card.Header className="fw-semibold">Species Mix</Card.Header>
                  <Card.Body className="p-0">
                    <Table hover className="table-centered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Pet Type</th>
                          <th className="text-end">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.speciesWise.map((row) => (
                          <tr key={row.petType}>
                            <td>{formatPetType(row.petType)}</td>
                            <td className="text-end">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header className="fw-semibold">Member & Vaccination Snapshot</Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">BPA Members</span>
                      <strong>{data.memberBreakdown.member}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Non-members</span>
                      <strong>{data.memberBreakdown.nonMember}</strong>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Up to date</span>
                      <strong>{data.vaccinationBreakdown.up_to_date}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Due</span>
                      <strong>{data.vaccinationBreakdown.due}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Not vaccinated</span>
                      <strong>{data.vaccinationBreakdown.not_vaccinated}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Unknown</span>
                      <strong>{data.vaccinationBreakdown.unknown}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </LoadingOverlay>
    </div>
  )
}
