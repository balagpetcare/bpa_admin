'use client'

import React from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'

export default function CampaignBasicsStep() {
  const { form: { control, formState: { errors } } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Campaign Basics</h5></Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Slug</Form.Label>
            <Controller name="slug" control={control} render={({ field }) => (
              <>
                <Form.Control {...field} isInvalid={!!errors.slug} />
                <Form.Control.Feedback type="invalid">{errors.slug?.message}</Form.Control.Feedback>
              </>
            )} />
          </Col>
          <Col md={3}>
            <Form.Label>Status</Form.Label>
            <Controller name="status" control={control} render={({ field }) => (
              <Form.Select {...field} isInvalid={!!errors.status}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="application_open">Application Open</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </Form.Select>
            )} />
          </Col>
          <Col md={3}>
            <Form.Label>Publish At</Form.Label>
            <Controller name="publishedAt" control={control} render={({ field }) => (
              <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Title (EN)</Form.Label>
            <Controller name="titleEn" control={control} render={({ field }) => (
              <>
                <Form.Control {...field} isInvalid={!!errors.titleEn} />
                <Form.Control.Feedback type="invalid">{errors.titleEn?.message}</Form.Control.Feedback>
              </>
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Title (BN)</Form.Label>
            <Controller name="titleBn" control={control} render={({ field }) => (
              <>
                <Form.Control {...field} isInvalid={!!errors.titleBn} />
                <Form.Control.Feedback type="invalid">{errors.titleBn?.message}</Form.Control.Feedback>
              </>
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Short Description (EN)</Form.Label>
            <Controller name="shortDescriptionEn" control={control} render={({ field }) => (
              <Form.Control as="textarea" rows={2} value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Short Description (BN)</Form.Label>
            <Controller name="shortDescriptionBn" control={control} render={({ field }) => (
              <Form.Control as="textarea" rows={2} value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
