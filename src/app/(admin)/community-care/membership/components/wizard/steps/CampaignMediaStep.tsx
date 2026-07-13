'use client'

import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'
import MediaPickerInput from '@/components/ui/MediaPickerInput'

export default function CampaignMediaStep() {
  const { form: { control } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Campaign Media</h5></Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col md={4}>
            <Controller name="heroImageUrl" control={control} render={({ field }) => (
              <MediaPickerInput value={field.value} previewUrl={field.value} onChange={(_, file) => field.onChange(file?.url ?? '')} label="Hero Image" emptyLabel="Select hero image" helpText="Recommended: 1200x600 (2:1)" />
            )} />
          </Col>
          <Col md={4}>
            <Controller name="mobileImageUrl" control={control} render={({ field }) => (
              <MediaPickerInput value={field.value} previewUrl={field.value} onChange={(_, file) => field.onChange(file?.url ?? '')} label="Mobile Image" emptyLabel="Select mobile image" helpText="Recommended: 600x600 (1:1)" />
            )} />
          </Col>
          <Col md={4}>
            <Controller name="thumbnailUrl" control={control} render={({ field }) => (
              <MediaPickerInput value={field.value} previewUrl={field.value} onChange={(_, file) => field.onChange(file?.url ?? '')} label="Thumbnail" emptyLabel="Select thumbnail" helpText="Recommended: 400x400 (1:1)" />
            )} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
