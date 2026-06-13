'use client'

import { useCallback } from 'react'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ContributionStatusBadge from './ContributionStatusBadge'
import { useApi } from '@/hooks/useApi'
import { careContributionsApi } from '@/lib/api/care-contributions.api'
import type { ApiError } from '@/lib/api'

export default function ContributorDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const fetchFn = useCallback(() => careContributionsApi.getById(id), [id])
  const { data: c, loading, error } = useApi(fetchFn, [id])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contributor Detail"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Contributors', href: '/community-care/contributors' }, { label: 'Detail' }]}
        action={
          <Button variant="outline-secondary" size="sm" onClick={() => router.push('/community-care/contributors')}>
            <Icon icon="solar:arrow-left-bold" className="me-1" />Back
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {c && (
          <Row className="g-3">
            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Contribution Info</Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <dt className="col-sm-5">Contribution #</dt>
                    <dd className="col-sm-7 font-monospace">{c.contributionNumber}</dd>
                    <dt className="col-sm-5">Status</dt>
                    <dd className="col-sm-7"><ContributionStatusBadge status={c.status} /></dd>
                    <dt className="col-sm-5">Plan</dt>
                    <dd className="col-sm-7">{c.plan.title}</dd>
                    <dt className="col-sm-5">Zone</dt>
                    <dd className="col-sm-7">{c.zone.name}</dd>
                    <dt className="col-sm-5">Amount</dt>
                    <dd className="col-sm-7 fw-bold">৳{Number(c.amountBdt).toLocaleString()}</dd>
                    <dt className="col-sm-5">Date</dt>
                    <dd className="col-sm-7">{new Date(c.createdAt).toLocaleDateString()}</dd>
                    <dt className="col-sm-5">Anonymous</dt>
                    <dd className="col-sm-7">{c.isAnonymous ? 'Yes' : 'No'}</dd>
                  </dl>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Contributor Info</Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <dt className="col-sm-5">Name</dt>
                    <dd className="col-sm-7">{c.isAnonymous ? 'Anonymous' : c.contributorName}</dd>
                    <dt className="col-sm-5">Mobile</dt>
                    <dd className="col-sm-7">{c.contributorMobile}</dd>
                    <dt className="col-sm-5">Email</dt>
                    <dd className="col-sm-7">{c.contributorEmail ?? '—'}</dd>
                    <dt className="col-sm-5">Address</dt>
                    <dd className="col-sm-7">{c.contributorAddress ?? '—'}</dd>
                  </dl>
                </Card.Body>
              </Card>
            </Col>
            {c.carePartnerCard && (
              <Col lg={12}>
                <Card className="border-success">
                  <Card.Header className="fw-semibold d-flex justify-content-between align-items-center">
                    Care Partner Card
                    <Link href={`/community-care/cards/${c.carePartnerCard.id}`} className="btn btn-soft-primary btn-sm">
                      <Icon icon="solar:eye-bold" className="me-1" />View Card
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    <dl className="row mb-0">
                      <dt className="col-sm-3">Card Number</dt>
                      <dd className="col-sm-9 font-monospace fw-bold">{c.carePartnerCard.cardNumber}</dd>
                      <dt className="col-sm-3">Card Status</dt>
                      <dd className="col-sm-9">
                        <Badge bg={c.carePartnerCard.status === 'active' ? 'success-subtle' : 'secondary-subtle'} text={c.carePartnerCard.status === 'active' ? 'success' : 'secondary'}>
                          {c.carePartnerCard.status}
                        </Badge>
                      </dd>
                    </dl>
                  </Card.Body>
                </Card>
              </Col>
            )}
            {c.plan.legalDisclaimerText && (
              <Col lg={12}>
                <Card className="border-warning bg-warning-subtle">
                  <Card.Body>
                    <Icon icon="solar:info-circle-bold" className="me-2 text-warning" />
                    <small>{c.plan.legalDisclaimerText}</small>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}
      </LoadingOverlay>
    </div>
  )
}
