'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { contentApi, Category } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  
  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nameEn, setNameEn] = useState('')
  const [nameBn, setNameBn] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await contentApi.listCategories()
      setCategories(data)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setNameEn('')
    setNameBn('')
    setSlug('')
    setDescription('')
    setShowModal(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingId(c.id)
    setNameEn(c.nameEn)
    setNameBn(c.nameBn)
    setSlug(c.slug)
    setDescription(c.description ?? '')
    setShowModal(true)
  }

  const handleAutoSlug = (val: string) => {
    setNameEn(val)
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameEn.trim() || !nameBn.trim() || !slug.trim()) return

    setSubmitting(true)
    try {
      const payload = { nameEn, nameBn, slug, description }
      if (editingId) {
        await contentApi.updateCategory(editingId, payload)
      } else {
        await contentApi.createCategory(payload)
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: Category) => {
    const ok = await confirmDelete(c.nameEn)
    if (!ok) return

    try {
      await contentApi.deleteCategory(c.id)
      fetchCategories()
    } catch (err) {
      setError(err as ApiError)
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Content Categories"
        breadcrumbs={[{ label: 'Content Hub' }, { label: 'Categories' }]}
        action={
          <Button variant="primary" onClick={handleOpenCreate}>
            <Icon icon="solar:folder-add-bold" className="me-1" />
            Add Category
          </Button>
        }
      />

      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />

      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <div className="table-responsive">
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Category Name (EN)</th>
                    <th>Category Name (BN)</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon="solar:folder-bold-duotone"
                          title="No categories found"
                          description="Create a content category to start organizing your posts."
                        />
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.id}>
                        <td><span className="fw-semibold text-dark">{c.nameEn}</span></td>
                        <td><span className="text-secondary">{c.nameBn}</span></td>
                        <td><code>{c.slug}</code></td>
                        <td className="text-muted">{c.description || '—'}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button variant="soft-primary" size="sm" onClick={() => handleOpenEdit(c)}>
                              <Icon icon="solar:pen-bold" />
                            </Button>
                            <Button variant="soft-danger" size="sm" onClick={() => handleDelete(c)}>
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Category' : 'Create Category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="space-y-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Name (English)</Form.Label>
              <Form.Control
                type="text"
                required
                value={nameEn}
                onChange={(e) => handleAutoSlug(e.target.value)}
                placeholder="e.g. Pet Care Tips"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Name (Bengali)</Form.Label>
              <Form.Control
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="e.g. পোষা প্রাণীর যত্ন"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Slug</Form.Label>
              <Form.Control
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. pet-care-tips"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}
