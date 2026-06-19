'use client'

import { Card, Button, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'

export default function EmptyDashboardState() {
  return (
    <Card className="border-0 shadow-sm text-center py-5 my-4">
      <Card.Body className="py-5">
        <div className="avatar-lg bg-soft-primary rounded-circle mx-auto mb-4 flex-centered" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2f7', color: '#1a6b3c' }}>
          <Icon icon="solar:box-minimalistic-bold-duotone" className="fs-40 text-primary" style={{ fontSize: '48px' }} />
        </div>
        <h3 className="fw-bold mb-2">No donations recorded yet</h3>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '500px' }}>
          The Bangladesh Pet Association Care Fund hasn&apos;t received any donations yet. Setup campaigns, publish purposes, and check the public donation page to begin fundraising.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link href="/donations/campaigns" passHref legacyBehavior>
            <Button variant="primary" className="d-flex align-items-center gap-2">
              <Icon icon="solar:target-bold-duotone" />
              <span>Create Campaign</span>
            </Button>
          </Link>
          <Link href="/donations/purposes" passHref legacyBehavior>
            <Button variant="outline-primary" className="d-flex align-items-center gap-2">
              <Icon icon="solar:heart-bold-duotone" />
              <span>Manage Purposes</span>
            </Button>
          </Link>
          <a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://bpa.org.bd'}/donate`} target="_blank" rel="noopener noreferrer" className="btn btn-soft-secondary d-flex align-items-center gap-2">
            <Icon icon="solar:link-bold-duotone" />
            <span>View Public Donation Page</span>
          </a>
        </div>
      </Card.Body>
    </Card>
  )
}
