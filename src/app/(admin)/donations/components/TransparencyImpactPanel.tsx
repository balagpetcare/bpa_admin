'use client'

import { Card, Button, ProgressBar } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'

interface TransparencyData {
  impactStoriesCount: number
  transparencyReportsCount: number
  totalReceived: number
  totalUsed: number
}

interface Props {
  data?: TransparencyData
}

export default function TransparencyImpactPanel({ data }: Props) {
  const impactStories = data?.impactStoriesCount ?? 0
  const reportsCount = data?.transparencyReportsCount ?? 0
  const received = data?.totalReceived ?? 0
  const used = data?.totalUsed ?? 0

  const usageRate = received > 0 ? (used / received) * 100 : 0

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="d-flex align-items-center justify-content-between bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <Icon icon="solar:eye-bold-duotone" className="text-success fs-20" />
          <span>Transparency & Impact Portal</span>
        </h5>
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Audit Budget Utilization</span>
              <span className="text-dark small fw-bold">{usageRate.toFixed(1)}% Used</span>
            </div>
            <ProgressBar now={usageRate} variant="success" className="mb-2" style={{ height: '8px' }} />
            <div className="d-flex align-items-center justify-content-between small text-muted">
              <span>Recv: ৳{received.toLocaleString()}</span>
              <span>Used: ৳{used.toLocaleString()}</span>
            </div>
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar-sm bg-soft-success text-success rounded flex-centered" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f5e9', color: '#1a6b3c' }}>
                <Icon icon="solar:star-bold-duotone" className="fs-20 text-success" />
              </div>
              <div>
                <h6 className="fw-semibold text-dark mb-0">{impactStories} Stories Published</h6>
                <p className="text-muted fs-12 mb-0">Rescues, treatment, and food deliveries logged.</p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="avatar-sm bg-soft-info text-info rounded flex-centered" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0f2f1', color: '#00695c' }}>
                <Icon icon="solar:document-text-bold-duotone" className="fs-20 text-info" />
              </div>
              <div>
                <h6 className="fw-semibold text-dark mb-0">{reportsCount} Audited Reports</h6>
                <p className="text-muted fs-12 mb-0">Monthly transparency sheets published.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mt-3 pt-3 border-top">
          <Link href="/donations/impact-stories" passHref legacyBehavior>
            <Button variant="outline-success" className="flex-fill py-2 small d-flex align-items-center justify-content-center gap-1">
              <Icon icon="solar:add-circle-bold-duotone" />
              <span>Manage Stories</span>
            </Button>
          </Link>
          <Link href="/donations/transparency-reports" passHref legacyBehavior>
            <Button variant="outline-primary" className="flex-fill py-2 small d-flex align-items-center justify-content-center gap-1">
              <Icon icon="solar:file-text-bold-duotone" />
              <span>Publish Reports</span>
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}
