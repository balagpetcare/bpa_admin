'use client'

import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { SmsStatus } from '@/types/bpa.types'

const SMS_STATUSES: SmsStatus[] = ['queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered', 'cancelled', 'skipped']

const FAILURE_REASONS = [
  { value: 'insufficient_balance', label: 'Insufficient Balance' },
  { value: 'gateway_timeout', label: 'Gateway Timeout' },
  { value: 'invalid_number', label: 'Invalid Number' },
  { value: 'gateway_error', label: 'Gateway Error' },
  { value: 'rate_limited', label: 'Rate Limited' },
  { value: 'unknown_error', label: 'Unknown Error' },
]

interface Props {
  search: string
  status: SmsStatus | ''
  module: string
  messageType: string
  failureReason: string
  isOtp: '' | 'true' | 'false'
  dateFrom: string
  dateTo: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: SmsStatus | '') => void
  onModuleChange: (v: string) => void
  onMessageTypeChange: (v: string) => void
  onFailureReasonChange: (v: string) => void
  onIsOtpChange: (v: '' | 'true' | 'false') => void
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onReset: () => void
}

export default function SmsFilterBar(props: Props) {
  return (
    <Row className="g-2 mb-3 align-items-end">
      <Col xs={12} md={3}>
        <InputGroup size="sm">
          <InputGroup.Text>
            <Icon icon="solar:magnifer-bold" />
          </InputGroup.Text>
          <Form.Control
            size="sm"
            placeholder="Search reference, phone..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
          />
        </InputGroup>
      </Col>

      <Col xs={6} sm={4} md={2}>
        <Form.Select size="sm" value={props.status} onChange={(e) => props.onStatusChange(e.target.value as SmsStatus | '')}>
          <option value="">All Statuses</option>
          {SMS_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col xs={6} sm={4} md={2}>
        <Form.Control size="sm" placeholder="Module (e.g. donations)" value={props.module} onChange={(e) => props.onModuleChange(e.target.value)} />
      </Col>

      <Col xs={6} sm={4} md={2}>
        <Form.Select size="sm" value={props.failureReason} onChange={(e) => props.onFailureReasonChange(e.target.value)}>
          <option value="">All Failure Reasons</option>
          {FAILURE_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col xs={6} sm={4} md={1}>
        <Form.Select size="sm" value={props.isOtp} onChange={(e) => props.onIsOtpChange(e.target.value as '' | 'true' | 'false')}>
          <option value="">OTP: All</option>
          <option value="false">Non-OTP</option>
          <option value="true">OTP Only</option>
        </Form.Select>
      </Col>

      <Col xs={6} sm={4} md={1}>
        <Form.Control size="sm" type="date" value={props.dateFrom} onChange={(e) => props.onDateFromChange(e.target.value)} />
      </Col>

      <Col xs={6} sm={4} md={1}>
        <Form.Control size="sm" type="date" value={props.dateTo} onChange={(e) => props.onDateToChange(e.target.value)} />
      </Col>

      <Col xs={12} sm="auto">
        <Button size="sm" variant="outline-secondary" onClick={props.onReset}>
          <Icon icon="solar:refresh-bold" /> Reset
        </Button>
      </Col>
    </Row>
  )
}
