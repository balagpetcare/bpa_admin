'use client'

import { useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import UserRoleSelect from './UserRoleSelect'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usersApi } from '@/lib/api/users.api'
import { rolesApi } from '@/lib/api/roles.api'
import type { AdminUser } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const baseFields = {
  name: yup.string().required('Name is required').max(120),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().nullable().optional(),
  isActive: yup.boolean().default(true),
  roleIds: yup.array(yup.string().required()).default([]),
}

const createSchema = yup.object({ ...baseFields, password: yup.string().required('Password is required').min(8, 'Min 8 characters') })
const editSchema = yup.object(baseFields)

type FormValues = {
  name: string
  email: string
  password?: string
  phone?: string | null
  isActive: boolean
  roleIds: string[]
}

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: AdminUser | null
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const isEdit = !!user
  const schema = isEdit ? editSchema : createSchema

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema as any),
    defaultValues: { name: '', email: '', password: '', phone: '', isActive: true, roleIds: [] },
  })

  const { data: rolesData, loading: rolesLoading } = useApi(() => rolesApi.list(), [])
  const { mutate, loading, error, clearError } = useApiMutation<AdminUser, FormValues>()

  useEffect(() => {
    if (isOpen) {
      clearError()
      if (user) {
        reset({ name: user.name, email: user.email, phone: user.phone ?? '', isActive: user.isActive, roleIds: user.roles.map((r) => r.id) })
      } else {
        reset({ name: '', email: '', password: '', phone: '', isActive: true, roleIds: [] })
      }
    }
  }, [isOpen, user, reset, clearError])

  const roleIds = watch('roleIds') ?? []

  const onSubmit = async (values: FormValues) => {
    const result = await mutate(async (vals) => {
      if (isEdit) {
        return usersApi.update(user!.id, {
          name: vals.name,
          email: vals.email,
          phone: vals.phone ?? undefined,
          isActive: vals.isActive,
          roleIds: vals.roleIds,
        })
      }
      return usersApi.create({ name: vals.name, email: vals.email, password: vals.password!, phone: vals.phone ?? undefined, roleIds: vals.roleIds })
    }, values)
    if (result) {
      onSuccess()
      onClose()
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit User' : 'Add User'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />
          <Row>
            <Col md={6}>
              <TextFormInput name="name" label="Full Name" placeholder="Enter full name" containerClassName="mb-3" control={control} />
            </Col>
            <Col md={6}>
              <TextFormInput name="email" label="Email Address" placeholder="Enter email" containerClassName="mb-3" control={control} />
            </Col>
          </Row>
          <Row>
            {!isEdit && (
              <Col md={6}>
                <TextFormInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Min 8 characters"
                  containerClassName="mb-3"
                  control={control}
                />
              </Col>
            )}
            <Col md={6}>
              <TextFormInput name="phone" label="Phone (optional)" placeholder="Enter phone number" containerClassName="mb-3" control={control} />
            </Col>
            {isEdit && (
              <Col md={6} className="mb-3 d-flex align-items-end pb-1">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="isActive"
                      label="Active account"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Col>
            )}
          </Row>
          <div className="mb-3">
            <UserRoleSelect roles={rolesData ?? []} value={roleIds} onChange={(ids) => setValue('roleIds', ids)} isLoading={rolesLoading} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
