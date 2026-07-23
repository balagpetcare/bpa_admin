'use client'

import { Card, Col, Row, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'

export default function PlaceholderModulePage({
  title,
  description,
  breadcrumbs,
}: {
  title: string
  description: string
  breadcrumbs: { label: string; href?: string }[]
}) {
  return (
    <>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 48, height: 48 }}>
                  <Icon icon="solar:widget-5-bold-duotone" width="24" />
                </div>
                <div>
                  <h5 className="mb-2">{title}</h5>
                  <p className="text-muted mb-3">{description}</p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button as={Link as any} href="/bpa-app-control/dashboard" variant="primary">
                      Back to Dashboard
                    </Button>
                    <Button variant="outline-secondary">Save Draft</Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3">Placeholder Module</h6>
              <p className="text-muted small mb-0">
                Backend integration is intentionally deferred. This page exists to reserve the route, structure, and navigation state for the next
                implementation phase.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}
