'use client'

import { Row, Col, Form, Card } from 'react-bootstrap'
import type { Control } from 'react-hook-form'
import TextFormInput from '@/components/form/TextFormInput'

 
interface EventCapacityFieldProps {
  control: Control<any>
  isPaid: boolean
  onIsPaidChange: (v: boolean) => void
}

export default function EventCapacityField({ control, isPaid, onIsPaidChange }: EventCapacityFieldProps) {
  return (
    <Card className="mb-3">
      <Card.Header className="py-2"><h6 className="mb-0">Capacity & Pricing</h6></Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <TextFormInput
              name="capacity"
              label="Max Capacity (optional)"
              placeholder="Leave empty for unlimited"
              type="number"
              containerClassName="mb-3"
              control={control}
            />
          </Col>
        </Row>
        <Form.Check
          type="switch"
          id="isPaid"
          label="Paid event"
          checked={isPaid}
          onChange={(e) => onIsPaidChange(e.target.checked)}
          className="mb-3"
        />
        {isPaid && (
          <TextFormInput
            name="fee"
            label="Registration Fee (৳)"
            placeholder="0.00"
            type="number"
            containerClassName="mb-0"
            control={control}
          />
        )}
      </Card.Body>
    </Card>
  )
}
