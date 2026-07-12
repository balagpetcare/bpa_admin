'use client'

import React from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'

export default function CampaignContentStep() {
  const { form: { control } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Full Description</h5></Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Label>Full Description (EN)</Form.Label>
            <Controller name="descriptionEn" control={control} render={({ field }) => (
              <Form.Control as="textarea" rows={6} value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={12}>
            <Form.Label>Full Description (BN)</Form.Label>
            <Controller name="descriptionBn" control={control} render={({ field }) => (
              <Form.Control as="textarea" rows={6} value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
