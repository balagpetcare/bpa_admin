'use client'

import React from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'
import BilingualRichText from '../../BilingualRichText'

export default function CampaignContentStep() {
  const { form: { control, formState: { errors } }, form } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Content Details</h5></Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Short Description (EN)</Form.Label>
            <Controller name="shortDescriptionEn" control={control} render={({ field }) => (
              <>
                <Form.Control as="textarea" rows={2} {...field} value={field.value ?? ''} isInvalid={!!errors.shortDescriptionEn} />
                <div className="d-flex justify-content-between">
                  <Form.Control.Feedback type="invalid">{errors.shortDescriptionEn?.message}</Form.Control.Feedback>
                  <small className="text-muted ms-auto">{(field.value ?? '').length} / 300</small>
                </div>
              </>
            )} />
          </Col>
          <Col md={6}>
            <Form.Label>Short Description (BN)</Form.Label>
            <Controller name="shortDescriptionBn" control={control} render={({ field }) => (
              <>
                <Form.Control as="textarea" rows={2} {...field} value={field.value ?? ''} isInvalid={!!errors.shortDescriptionBn} />
                <div className="d-flex justify-content-between">
                  <Form.Control.Feedback type="invalid">{errors.shortDescriptionBn?.message}</Form.Control.Feedback>
                  <small className="text-muted ms-auto">{(field.value ?? '').length} / 300</small>
                </div>
              </>
            )} />
          </Col>
        </Row>
        <hr className="my-4" />
        <BilingualRichText
          labelEn="Full Description (EN)"
          labelBn="Full Description (BN)"
          valueEn={form.watch('descriptionEn') ?? ''}
          valueBn={form.watch('descriptionBn') ?? ''}
          onChangeEn={(val) => form.setValue('descriptionEn', val, { shouldValidate: true, shouldDirty: true })}
          onChangeBn={(val) => form.setValue('descriptionBn', val, { shouldValidate: true, shouldDirty: true })}
        />
      </Card.Body>
    </Card>
  )
}
