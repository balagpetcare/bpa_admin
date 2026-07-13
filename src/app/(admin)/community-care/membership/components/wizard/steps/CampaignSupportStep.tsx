'use client'

import React from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'

export default function CampaignSupportStep() {
  const { form: { control, formState: { errors } } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Organizer & Support</h5></Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Organizer (EN)</Form.Label>
            <Controller name="organizerNameEn" control={control} render={({ field }) => (
              <Form.Control value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Organizer (BN)</Form.Label>
            <Controller name="organizerNameBn" control={control} render={({ field }) => (
              <Form.Control value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={4}>
            <Form.Label>Support Phone</Form.Label>
            <Controller name="supportPhone" control={control} render={({ field }) => (
              <Form.Control 
                value={field.value ?? ''} 
                onChange={(e) => field.onChange(e.target.value.replace(/[^\d+]/g, ''))} 
              />
            )} />
          </Col>
          <Col md={4}>
            <Form.Label>Support Email</Form.Label>
            <Controller name="supportEmail" control={control} render={({ field }) => (
              <>
                <Form.Control type="email" {...field} value={field.value ?? ''} isInvalid={!!errors.supportEmail} />
                <Form.Control.Feedback type="invalid">{errors.supportEmail?.message}</Form.Control.Feedback>
              </>
            )} />
          </Col>
          <Col md={4}>
            <Form.Label>Support WhatsApp</Form.Label>
            <Controller name="supportWhatsapp" control={control} render={({ field }) => (
              <Form.Control 
                value={field.value ?? ''} 
                onChange={(e) => field.onChange(e.target.value.replace(/[^\d+]/g, ''))} 
              />
            )} />
          </Col>
          <Col md={12}>
            <Form.Label>Support Address</Form.Label>
            <Controller name="supportAddress" control={control} render={({ field }) => (
              <Form.Control as="textarea" rows={2} value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
