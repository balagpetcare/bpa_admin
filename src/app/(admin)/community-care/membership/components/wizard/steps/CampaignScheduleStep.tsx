'use client'

import React from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'

export default function CampaignScheduleStep() {
  const { form: { control } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Offer & Application Schedule</h5></Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Offer Start</Form.Label>
            <Controller name="offerStartAt" control={control} render={({ field }) => (
              <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Offer End</Form.Label>
            <Controller name="offerEndAt" control={control} render={({ field }) => (
              <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Application Start</Form.Label>
            <Controller name="applicationStartAt" control={control} render={({ field }) => (
              <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Application End</Form.Label>
            <Controller name="applicationEndAt" control={control} render={({ field }) => (
              <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
