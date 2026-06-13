'use client'

import { useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import PermissionMatrix from './PermissionMatrix'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { rolesApi } from '@/lib/api/roles.api'
import type { Role } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const schema = yup.object({
  name: yup.string().required('Name is required').max(60),
  description: yup.string().nullable().optional(),
  permissionIds: yup.array(yup.string().required()).default([]),
})

type FormValues = { name: string; description?: string | null; permissionIds: string[] }

interface RoleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  role?: Role | null
}

export default function RoleFormModal({ isOpen, onClose, onSuccess, role }: RoleFormModalProps) {
  const isEdit = !!role

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema as any),
    defaultValues: { name: '', description: '', permissionIds: [] },
  })

  const { data: permissions, loading: permsLoading } = useApi(() => rolesApi.listPermissions(), [])
  const { mutate, loading, error, clearError } = useApiMutation<Role, FormValues>()

  useEffect(() => {
    if (isOpen) {
      clearError()
      if (role) {
        reset({ name: role.name, description: role.description ?? '', permissionIds: role.permissions.map((p) => p.id) })
      } else {
        reset({ name: '', description: '', permissionIds: [] })
      }
    }
  }, [isOpen, role, reset, clearError])

  const permissionIds = watch('permissionIds') ?? []

  const onSubmit = async (values: FormValues) => {
    const result = await mutate(
      async (vals) => {
        if (isEdit) {
          return rolesApi.update(role!.id, { name: vals.name, description: vals.description ?? undefined, permissionIds: vals.permissionIds })
        }
        return rolesApi.create({ name: vals.name, description: vals.description ?? undefined, permissionIds: vals.permissionIds })
      },
      values,
    )
    if (result) { onSuccess(); onClose() }
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" backdrop="static" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Role' : 'Create Role'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />
          <Row className="mb-3">
            <Col md={6}>
              <TextFormInput name="name" label="Role Name" placeholder="e.g. content_editor" containerClassName="mb-0" control={control} />
            </Col>
            <Col md={6}>
              <TextFormInput name="description" label="Description (optional)" placeholder="Brief description" containerClassName="mb-0" control={control} />
            </Col>
          </Row>
          <div>
            <Form.Label className="fw-semibold">Permissions</Form.Label>
            <p className="text-muted small mb-2">Click a resource name or action header to toggle an entire row/column.</p>
            {permsLoading ? (
              <p className="text-muted small">Loading permissions...</p>
            ) : (
              <PermissionMatrix
                permissions={permissions ?? []}
                selected={permissionIds}
                onChange={(ids) => setValue('permissionIds', ids)}
              />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Role'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
