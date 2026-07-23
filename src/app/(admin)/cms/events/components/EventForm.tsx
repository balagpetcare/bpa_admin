'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import EventDateTimePicker from './EventDateTimePicker'
import EventCapacityField from './EventCapacityField'
import EventPublishPanel from './EventPublishPanel'
import RegistrationsTab from './RegistrationsTab'
import { useApiMutation } from '@/hooks/useApi'
import { eventsApi } from '@/lib/api/events.api'
import type { EventListItem, EventStatus, MediaFile } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const normalizeOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return null
    return Number.isFinite(Number(trimmed)) ? Number(trimmed) : null
  }

  return Number.isFinite(Number(value)) ? Number(value) : null
}

const schema = yup.object({
  title: yup.string().required('Title is required').max(255),
  slug: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
  location: yup.string().nullable().optional(),
  coverImageId: yup.string().nullable().optional(),
  startsAt: yup.string().required('Start date is required'),
  endsAt: yup.string().nullable().optional(),
  capacity: yup
    .number()
    .nullable()
    .optional()
    .transform((value) => normalizeOptionalNumber(value)),
  isPaid: yup.boolean().default(false),
  fee: yup
    .number()
    .nullable()
    .optional()
    .transform((value) => normalizeOptionalNumber(value)),
  status: yup.string().oneOf(['draft', 'published', 'cancelled']).default('draft') as unknown as yup.StringSchema<EventStatus>,
})

type FormValues = yup.InferType<typeof schema>

const normalizeOptionalNumberForApi = (value: number | string | null | undefined): number | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? null : Number(trimmed)
  }

  return value ?? null
}

interface EventFormProps {
  existing?: EventListItem | null
}

export default function EventForm({ existing }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!existing
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(existing?.coverImageUrl ?? null)
  const [activeTab, setActiveTab] = useState('details')

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema as any),
    defaultValues: {
      title: existing?.title ?? '',
      slug: existing?.slug ?? '',
      description: existing?.description ?? '',
      location: existing?.location ?? '',
      coverImageId: null,
      startsAt: existing?.startsAt ?? '',
      endsAt: existing?.endsAt ?? '',
      capacity: existing?.capacity ?? null,
      isPaid: existing?.isPaid ?? false,
      fee: existing?.fee !== null && existing?.fee !== undefined ? Number(existing.fee) : null,
      status: existing?.status ?? 'draft',
    },
  })

  const isPaid = watch('isPaid')
  const statusValue = watch('status')
  const startsAt = watch('startsAt')

  const { mutate, loading, error, clearError } = useApiMutation<EventListItem, FormValues>()

  const saveWith = async (overrideStatus?: EventStatus) => {
    await handleSubmit(async (values) => {
      const finalValues = overrideStatus ? { ...values, status: overrideStatus } : values
      const result = await mutate(async (vals) => {
        const dto = {
          title: vals.title,
          slug: vals.slug ?? undefined,
          description: vals.description ?? undefined,
          location: vals.location ?? undefined,
          coverImageId: vals.coverImageId ?? null,
          startsAt: vals.startsAt,
          endsAt: vals.endsAt ?? null,
          capacity: normalizeOptionalNumberForApi(vals.capacity),
          isPaid: vals.isPaid,
          fee: normalizeOptionalNumberForApi(vals.fee),
        }
        if (isEdit) {
          const updated = await eventsApi.update(existing!.id, dto)
          if (vals.status !== existing!.status) {
            return eventsApi.publish(existing!.id, { status: vals.status })
          }
          return updated
        }
        const created = await eventsApi.create(dto)
        if (vals.status === 'published') {
          return eventsApi.publish(created.id, { status: 'published' })
        }
        return created
      }, finalValues)
      if (result) router.push('/cms/events')
    })()
  }

  return (
    <div className="container-fluid">
      <div className="mb-3 d-flex align-items-center gap-2">
        <Button variant="light" size="sm" onClick={() => router.push('/cms/events')}>
          ← Back to Events
        </Button>
        <h5 className="mb-0">{isEdit ? `Edit: ${existing!.title}` : 'New Event'}</h5>
      </div>

      <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k ?? 'details')} className="mb-3">
                <Tab eventKey="details" title="Details">
                  <TextFormInput name="title" label="Title" placeholder="Event title" containerClassName="mb-3" control={control} />
                  <TextFormInput
                    name="location"
                    label="Location (optional)"
                    placeholder="Venue or online link"
                    containerClassName="mb-3"
                    control={control}
                  />
                  <TextAreaFormInput
                    name="description"
                    label="Description"
                    placeholder="Event description…"
                    rows={5}
                    containerClassName="mb-3"
                    control={control}
                  />

                  <Row>
                    <Col md={6}>
                      <EventDateTimePicker
                        label="Start Date & Time"
                        value={startsAt}
                        onChange={(d) => setValue('startsAt', d ?? '')}
                        required
                        error={errors.startsAt?.message}
                      />
                    </Col>
                    <Col md={6}>
                      <EventDateTimePicker
                        label="End Date & Time (optional)"
                        value={watch('endsAt')}
                        onChange={(d) => setValue('endsAt', d)}
                        minDate={startsAt ?? undefined}
                      />
                    </Col>
                  </Row>

                  <EventCapacityField control={control} isPaid={!!isPaid} onIsPaidChange={(v) => setValue('isPaid', v)} />
                </Tab>

                {isEdit && (
                  <Tab eventKey="registrations" title={`Registrations`}>
                    <RegistrationsTab eventId={existing!.id} />
                  </Tab>
                )}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <EventPublishPanel
            status={statusValue}
            onStatusChange={(s) => setValue('status', s)}
            onSaveDraft={() => saveWith('draft')}
            onPublish={() => saveWith('published')}
            onCancel={isEdit ? () => saveWith('cancelled') : undefined}
            saving={loading}
            isEdit={isEdit}
          />

          <Card className="mb-3">
            <Card.Header className="py-2">
              <h6 className="mb-0">Cover Image</h6>
            </Card.Header>
            <Card.Body>
              <MediaPickerInput
                value={watch('coverImageId')}
                previewUrl={coverImageUrl}
                onChange={(id, file) => {
                  setValue('coverImageId', id)
                  setCoverImageUrl((file as MediaFile | null)?.url ?? null)
                }}
                helpText="Recommended: 1200×630px"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
