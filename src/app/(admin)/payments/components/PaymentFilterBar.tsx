'use client'

import { Form, InputGroup, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { PaymentStatus, PaymentGateway } from '@/types/bpa.types'

interface PaymentFilterBarProps {
  search: string
  status: PaymentStatus | ''
  gateway: PaymentGateway | ''
  onSearchChange: (v: string) => void
  onStatusChange: (v: PaymentStatus | '') => void
  onGatewayChange: (v: PaymentGateway | '') => void
}

export default function PaymentFilterBar({
  search, status, gateway,
  onSearchChange, onStatusChange, onGatewayChange,
}: PaymentFilterBarProps) {
  return (
    <div className="d-flex gap-2 mb-3 flex-wrap">
      <InputGroup style={{ maxWidth: 320 }}>
        <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
        <Form.Control
          placeholder="Search by reference or ID…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => onSearchChange('')}>
            <Icon icon="solar:close-circle-bold" />
          </Button>
        )}
      </InputGroup>

      <Form.Select
        style={{ maxWidth: 160 }}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PaymentStatus | '')}
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="success">Success</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </Form.Select>

      <Form.Select
        style={{ maxWidth: 160 }}
        value={gateway}
        onChange={(e) => onGatewayChange(e.target.value as PaymentGateway | '')}
      >
        <option value="">All gateways</option>
        <option value="eps">EPS</option>
      </Form.Select>
    </div>
  )
}
