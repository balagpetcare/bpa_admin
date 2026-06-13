'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Row, Col, Form, Button, Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import SeoOgImagePicker from './SeoOgImagePicker'
import SeoPreviewCard from './SeoPreviewCard'
import { seoApi } from '@/lib/api/seo.api'
import type { SeoMetadata } from '@/types/bpa.types'
import type { MediaFile } from '@/types/bpa.types'

const schema = yup.object({
  route: yup.string().required('Route is required').matches(/^\//, 'Route must start with /'),
  title: yup.string().nullable().default(null),
  description: yup.string().nullable().default(null),
  ogTitle: yup.string().nullable().default(null),
  ogDescription: yup.string().nullable().default(null),
  ogImageId: yup.string().nullable().default(null),
  schemaJson: yup.string().nullable().default(null),
})

type FormValues = yup.InferType<typeof schema>

interface SeoEditorFormProps {
  entry: SeoMetadata | null
  onSaved: () => void
  onCancel: () => void
}

export default function SeoEditorForm({ entry, onSaved, onCancel }: SeoEditorFormProps) {
  const isEdit = !!entry
  const [ogPreviewUrl, setOgPreviewUrl] = useState<string | null>(entry?.ogImageUrl ?? null)
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      route: entry?.route ?? '',
      title: entry?.title ?? null,
      description: entry?.description ?? null,
      ogTitle: entry?.ogTitle ?? null,
      ogDescription: entry?.ogDescription ?? null,
      ogImageId: null,
      schemaJson: entry?.schemaJson ? JSON.stringify(entry.schemaJson, null, 2) : null,
    },
  })

  useEffect(() => {
    if (entry) {
      reset({
        route: entry.route,
        title: entry.title ?? null,
        description: entry.description ?? null,
        ogTitle: entry.ogTitle ?? null,
        ogDescription: entry.ogDescription ?? null,
        ogImageId: null,
        schemaJson: entry.schemaJson ? JSON.stringify(entry.schemaJson, null, 2) : null,
      })
      setOgPreviewUrl(entry.ogImageUrl ?? null)
    }
  }, [entry, reset])

  const watched = watch()

  const onSubmit = async (values: FormValues) => {
    let schemaJson: Record<string, unknown> | null = null
    if (values.schemaJson) {
      try {
        schemaJson = JSON.parse(values.schemaJson)
        setJsonError(null)
      } catch {
        setJsonError('Invalid JSON')
        return
      }
    }

    setSaving(true)
    try {
      await seoApi.upsert(values.route, {
        title: values.title || null,
        description: values.description || null,
        ogTitle: values.ogTitle || null,
        ogDescription: values.ogDescription || null,
        ogImageId: values.ogImageId || null,
        schemaJson,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Row className="g-3">
        <Col md={12}>
          <TextFormInput
            name="route"
            label="Route"
            control={control}
            placeholder="/about"
            disabled={isEdit}
          />
          <Form.Text className="text-muted">
            {isEdit ? 'Route cannot be changed after creation.' : 'E.g. /about, /events, /contact'}
          </Form.Text>
        </Col>

        <Col md={6}>
          <TextFormInput name="title" label="Page Title" control={control} placeholder="About BPA" />
        </Col>
        <Col md={6}>
          <TextAreaFormInput name="description" label="Meta Description" control={control} rows={3} placeholder="A short description of this page…" />
        </Col>

        <Col md={6}>
          <TextFormInput name="ogTitle" label="OG Title" control={control} placeholder="Defaults to page title if empty" />
        </Col>
        <Col md={6}>
          <TextAreaFormInput name="ogDescription" label="OG Description" control={control} rows={3} placeholder="Defaults to meta description if empty" />
        </Col>

        <Col md={12}>
          <Controller
            name="ogImageId"
            control={control}
            render={({ field }) => (
              <SeoOgImagePicker
                value={field.value ?? null}
                previewUrl={ogPreviewUrl}
                onChange={(fileId, file: MediaFile | null) => {
                  field.onChange(fileId)
                  setOgPreviewUrl(file?.url ?? null)
                }}
              />
            )}
          />
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label>Schema.org JSON-LD <span className="text-muted small">(optional)</span></Form.Label>
            <Controller
              name="schemaJson"
              control={control}
              render={({ field }) => (
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Organization"\n}'}
                  value={field.value ?? ''}
                  onChange={(e) => { field.onChange(e.target.value || null); setJsonError(null) }}
                  isInvalid={!!jsonError}
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              )}
            />
            {jsonError && <Form.Control.Feedback type="invalid">{jsonError}</Form.Control.Feedback>}
          </Form.Group>
        </Col>

        <Col md={12}>
          <Card className="border">
            <Card.Header className="py-2 px-3 bg-light">
              <small className="fw-semibold">SERP Preview</small>
            </Card.Header>
            <Card.Body className="p-3">
              <SeoPreviewCard
                route={watched.route || '/'}
                title={watched.title || ''}
                description={watched.description || ''}
                ogTitle={watched.ogTitle || undefined}
                ogDescription={watched.ogDescription || undefined}
                ogImageUrl={ogPreviewUrl}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? (
            <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
          ) : (
            <><Icon icon="solar:diskette-bold" className="me-1" />{isEdit ? 'Update' : 'Create'}</>
          )}
        </Button>
      </div>
    </form>
  )
}
