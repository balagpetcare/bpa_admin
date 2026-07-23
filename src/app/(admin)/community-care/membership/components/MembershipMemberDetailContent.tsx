'use client'

import { useCallback } from 'react'
import { Button, Card, Col, Row, Table } from 'react-bootstrap'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import QrCodeImage from '@/components/ui/QrCodeImage'
import { useApi } from '@/hooks/useApi'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipMemberDetailContent({ membershipId }: { membershipId: string }) {
  const fetchFn = useCallback(() => membershipCampaignApi.getMembership(membershipId), [membershipId])
  const { data, loading, error } = useApi(fetchFn, [membershipId])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Membership Detail"
        breadcrumbs={[
          { label: 'Membership Management' },
          { label: 'Active Members', href: '/community-care/membership/members' },
          { label: data?.membershipNumber ?? 'Detail' },
        ]}
        action={
          <Link href="/community-care/membership/members" className="btn btn-light">
            Back
          </Link>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {data && (
          <>
            <Row className="g-3">
              <Col lg={4}>
                <Card>
                  <Card.Body>
                    <div className="text-muted small">Member</div>
                    <div className="fw-semibold">{data.membershipNumber ?? '-'}</div>
                    <div>{data.cardNumber ?? '-'}</div>
                    <div className="mt-2">
                      <StatusBadge status={data.membershipStatus} />
                    </div>
                    <div className="mt-3 text-muted small">Plan</div>
                    <div>{data.plan?.nameEn ?? data.plan?.code ?? '-'}</div>
                    <div className="text-muted small mt-3">Validity</div>
                    <div>
                      {data.validity.validFrom ? new Date(data.validity.validFrom).toLocaleDateString() : '-'} to{' '}
                      {data.validity.validUntil ? new Date(data.validity.validUntil).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-muted small mt-3">Covered Pet Usage</div>
                    <div>
                      {data.currentCoveredPets.length} / {data.maximumCoveredPets ?? '-'}
                    </div>
                    <div className="text-muted small mt-3">Remaining Slots</div>
                    <div>{data.remainingSlots}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <Card.Body>
                    <div className="text-muted small mb-2">QR Verification</div>
                    {data.qrVerificationData ? (
                      <QrCodeImage value={JSON.stringify(data.qrVerificationData)} size={220} />
                    ) : (
                      <div className="text-muted small">QR data unavailable</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <Card.Body>
                    <div className="text-muted small">Replacement Allowance</div>
                    <div>
                      {data.replacementAllowance?.usedReplacementCount ?? 0} used / {data.replacementAllowance?.maximumReplacementCount ?? 0}
                    </div>
                    <div className="text-muted small mt-3">Upgrade History</div>
                    <div>{data.upgradeOptions?.length ?? 0} option(s) currently available</div>
                    <div className="text-muted small mt-3">Benefits</div>
                    <ul className="mb-0">
                      {data.benefits.map((benefit) => (
                        <li key={benefit.id}>{benefit.titleEn}</li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 mt-1">
              <Col xl={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Covered Pet History</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Pet</th>
                          <th>Slot</th>
                          <th>Status</th>
                          <th>Linked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.linkedPetHistory.map((item) => (
                          <tr key={item.id}>
                            <td>{item.pet?.name ?? item.petId}</td>
                            <td>{item.slotNumber}</td>
                            <td>
                              <StatusBadge status={item.status} />
                            </td>
                            <td>{new Date(item.linkedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Service Usage</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Pet</th>
                          <th>Clinic</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.serviceUsageHistory.map((item) => (
                          <tr key={item.id}>
                            <td>{item.serviceName}</td>
                            <td>{item.pet?.name ?? '-'}</td>
                            <td>{item.clinic?.name ?? '-'}</td>
                            <td>{new Date(item.serviceDate).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 mt-1">
              <Col xl={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Current Covered Pets</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Pet</th>
                          <th>Slot</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.currentCoveredPets.map((item) => (
                          <tr key={item.id}>
                            <td>{item.pet?.name ?? item.petId}</td>
                            <td>{item.slotNumber}</td>
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
              <Col xl={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Upgrade Options</h5>
                  </Card.Header>
                  <Card.Body>
                    {data.upgradeOptions?.length ? (
                      <ul className="mb-0">
                        {data.upgradeOptions.map((option) => (
                          <li key={option.id}>
                            {option.code} · {option.maxCoveredPets} covered pets
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted small">No higher plan currently available.</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="mt-3">
              <Card.Header>
                <h5 className="mb-0">Audit History</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-muted small">
                  Membership audit events are written by the backend. A dedicated admin audit feed endpoint is not present in this app yet, so this
                  panel intentionally avoids showing incomplete or guessed history.
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </LoadingOverlay>
    </div>
  )
}
