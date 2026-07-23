'use client'

import { Card, Button, ListGroup, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import type { Donation } from '@/lib/api/donations.api'

interface Props {
  pendingReviewCount: number
  failedCount: number
  recentPendingReview: Donation[]
}

export default function PendingActionsPanel({ pendingReviewCount, failedCount, recentPendingReview }: Props) {
  const hasActions = pendingReviewCount > 0 || failedCount > 0

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="d-flex align-items-center justify-content-between bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <Icon icon="solar:shield-warning-bold-duotone" className="text-warning fs-20" />
          <span>Pending Actions Workspace</span>
        </h5>
        {pendingReviewCount > 0 && (
          <Badge bg="danger" className="rounded-pill px-2 py-1">
            {pendingReviewCount} Action Needed
          </Badge>
        )}
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex gap-3 mb-4">
            <div className="flex-fill bg-light p-3 rounded text-center border">
              <h4 className="fw-bold text-warning mb-1">{pendingReviewCount}</h4>
              <span className="text-muted fs-12 uppercase">MFS Reviews</span>
            </div>
            <div className="flex-fill bg-light p-3 rounded text-center border">
              <h4 className="fw-bold text-danger mb-1">{failedCount}</h4>
              <span className="text-muted fs-12 uppercase">Failed Txns</span>
            </div>
          </div>

          <h6 className="fw-semibold text-dark mb-3">Verification Requests (Pending Review)</h6>

          {recentPendingReview.length === 0 ? (
            <div className="text-center py-4 bg-light rounded text-muted">
              <Icon icon="solar:check-circle-bold-duotone" className="text-success fs-32 mb-1" />
              <p className="mb-0 fs-13">All manual transfers verified!</p>
            </div>
          ) : (
            <ListGroup variant="flush" className="border-0">
              {recentPendingReview.slice(0, 3).map((d) => (
                <ListGroup.Item
                  key={d.id}
                  className="px-0 py-2 bg-transparent border-bottom border-light d-flex align-items-center justify-content-between">
                  <div className="overflow-hidden me-2">
                    <div className="fw-semibold text-dark fs-13 text-truncate">{d.donorName}</div>
                    <div className="text-muted fs-11 font-monospace">
                      {d.referenceNo} • ৳{Number(d.amount).toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/donations/list?search=${d.referenceNo}`} passHref legacyBehavior>
                    <Button variant="soft-warning" size="sm" className="px-3 fs-11 py-1">
                      Verify MFS
                    </Button>
                  </Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

        <div className="mt-4 pt-3 border-top d-flex flex-column gap-2">
          {pendingReviewCount > 0 && (
            <Link href="/donations/list?status=pending_review" passHref legacyBehavior>
              <Button variant="warning" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 text-dark fw-semibold">
                <Icon icon="solar:check-square-bold-duotone" />
                <span>Go to Verification Board</span>
              </Button>
            </Link>
          )}
          {failedCount > 0 && (
            <Link href="/donations/list?status=failed" passHref legacyBehavior>
              <Button variant="outline-danger" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                <Icon icon="solar:phone-calling-bold-duotone" />
                <span>Follow up Failed Payments</span>
              </Button>
            </Link>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
