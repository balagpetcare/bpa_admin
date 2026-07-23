'use client'

import { Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { VolunteerStatus } from '@/types/bpa.types'

interface VolunteerFilterBarProps {
  search: string
  status: VolunteerStatus | ''
  onSearchChange: (v: string) => void
  onStatusChange: (v: VolunteerStatus | '') => void
}

const STATUS_OPTIONS: { value: VolunteerStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function VolunteerFilterBar({ search, status, onSearchChange, onStatusChange }: VolunteerFilterBarProps) {
  return (
    <Row className="g-2 mb-3">
      <Col md={5}>
        <InputGroup>
          <InputGroup.Text>
            <Icon icon="solar:magnifer-bold" />
          </InputGroup.Text>
          <Form.Control placeholder="Search by name or email…" value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </InputGroup>
      </Col>
      <Col md={3}>
        <Form.Select value={status} onChange={(e) => onStatusChange(e.target.value as VolunteerStatus | '')}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  )
}
