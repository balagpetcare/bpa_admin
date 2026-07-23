'use client'

import { useEffect, useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import CommitteePhotoUpload from './CommitteePhotoUpload'
import { useApiMutation } from '@/hooks/useApi'
import { committeeApi } from '@/lib/api/committee.api'
import type { CommitteeMember, MediaFile } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const schema = yup.object({
  name: yup.string().required('Name is required').max(120),
  designation: yup.string().required('Designation is required').max(120),
  bio: yup.string().nullable().optional(),
  email: yup.string().email('Invalid email').nullable().optional(),
  phone: yup.string().nullable().optional(),
  photoId: yup.string().nullable().optional(),
  isActive: yup.boolean().default(true),
})

type FormValues = yup.InferType<typeof schema>

interface CommitteeFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  member?: CommitteeMember | null
}

export default function CommitteeForm({ isOpen, onClose, onSuccess, member }: CommitteeFormProps) {
  const isEdit = !!member
  const [photoUrl, setPhotoUrl] = useState<string | null>(member?.photoUrl ?? null)

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema as any),
    defaultValues: { name: '', designation: '', bio: '', email: '', phone: '', photoId: null, isActive: true },
  })

  const { mutate, loading, error, clearError } = useApiMutation<CommitteeMember, FormValues>()

  useEffect(() => {
    if (isOpen) {
      clearError()
      setPhotoUrl(member?.photoUrl ?? null)
      if (member) {
        reset({
          name: member.name,
          designation: member.designation,
          bio: member.bio ?? '',
          email: member.email ?? '',
          phone: member.phone ?? '',
          photoId: null,
          isActive: member.isActive,
        })
      } else {
        reset({ name: '', designation: '', bio: '', email: '', phone: '', photoId: null, isActive: true })
      }
    }
  }, [isOpen, member, reset, clearError])

  const onSubmit = async (values: FormValues) => {
    const result = await mutate(async (vals) => {
      const dto = {
        name: vals.name,
        designation: vals.designation,
        bio: vals.bio ?? null,
        email: vals.email ?? null,
        phone: vals.phone ?? null,
        photoId: vals.photoId ?? null,
        isActive: vals.isActive,
      }
      return isEdit ? committeeApi.update(member!.id, dto) : committeeApi.create(dto)
    }, values)
    if (result) {
      onSuccess()
      onClose()
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Member' : 'Add Member'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />
          <Row>
            <Col md={7}>
              <TextFormInput name="name" label="Full Name" placeholder="Member name" containerClassName="mb-3" control={control} />
              <TextFormInput
                name="designation"
                label="Designation / Title"
                placeholder="e.g. President"
                containerClassName="mb-3"
                control={control}
              />
              <Row>
                <Col md={6}>
                  <TextFormInput name="email" label="Email (optional)" placeholder="member@example.com" containerClassName="mb-3" control={control} />
                </Col>
                <Col md={6}>
                  <TextFormInput name="phone" label="Phone (optional)" placeholder="+880…" containerClassName="mb-3" control={control} />
                </Col>
              </Row>
              <TextAreaFormInput
                name="bio"
                label="Biography (optional)"
                placeholder="Brief bio…"
                rows={4}
                containerClassName="mb-3"
                control={control}
              />
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Form.Check
                    type="switch"
                    id="memberActive"
                    label="Active member"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </Col>
            <Col md={5}>
              <CommitteePhotoUpload
                value={watch('photoId')}
                previewUrl={photoUrl}
                onChange={(id, file) => {
                  setValue('photoId', id)
                  setPhotoUrl((file as MediaFile | null)?.url ?? null)
                }}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
