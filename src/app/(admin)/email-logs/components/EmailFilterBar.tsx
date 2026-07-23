'use client'

import { Form, InputGroup, Button, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { EmailStatus } from '@/types/bpa.types'

interface EmailFilterBarProps {
  search: string
  status: EmailStatus | ''
  dateFrom: string
  dateTo: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: EmailStatus | '') => void
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
}

export default function EmailFilterBar({
  search,
  status,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
}: EmailFilterBarProps) {
  return (
    <Row className="g-2 mb-3">
      <Col xs={12} md={4}>
        <InputGroup>
          <InputGroup.Text>
            <Icon icon="solar:magnifer-bold" />
          </InputGroup.Text>
          <Form.Control placeholder="Search by recipient or subject…" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          {search && (
            <Button variant="outline-secondary" onClick={() => onSearchChange('')}>
              <Icon icon="solar:close-circle-bold" />
            </Button>
          )}
        </InputGroup>
      </Col>

      <Col xs={6} md={2}>
        <Form.Select value={status} onChange={(e) => onStatusChange(e.target.value as EmailStatus | '')}>
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="bounced">Bounced</option>
          <option value="spam">Spam</option>
        </Form.Select>
      </Col>

      <Col xs={6} md={3}>
        <Form.Control type="date" title="From date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
      </Col>

      <Col xs={6} md={3}>
        <Form.Control type="date" title="To date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
      </Col>
    </Row>
  )
}
