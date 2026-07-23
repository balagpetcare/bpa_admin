'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Badge, Form, Row, Col, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { listImpactStories, deleteImpactStory, type DonationImpactStory } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

export default function ImpactStoryList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isPublished, setIsPublished] = useState('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fn = useCallback(
    () => listImpactStories({ search: search || undefined, isPublished: isPublished === '' ? undefined : isPublished === 'true' }),
    [search, isPublished],
  )
  const { data: stories, loading, error, refetch } = useApi(fn, [search, isPublished])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete story "${title}"?`)) return
    await mutate(() => deleteImpactStory(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Impact Stories"
        breadcrumbs={[{ label: 'Donations' }, { label: 'Impact Stories' }]}
        action={
          <Link href="/donations/impact-stories/create" className="btn btn-primary btn-sm">
            <Icon icon="solar:add-circle-bold" className="me-1" />
            New Story
          </Link>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <Icon icon="solar:magnifer-bold" />
                </InputGroup.Text>
                <Form.Control placeholder="Search stories..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={isPublished} onChange={(e) => setIsPublished(e.target.value)}>
                <option value="">All</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Story</th>
                  <th>Type</th>
                  <th>Animal</th>
                  <th>Campaign / Purpose</th>
                  <th>Published</th>
                  <th>Featured</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(stories ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No stories found.
                    </td>
                  </tr>
                ) : (
                  (stories ?? []).map((s: DonationImpactStory) => (
                    <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/donations/impact-stories/${s.id}`)}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {(s.afterImageUrl || s.beforeImageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.afterImageUrl || s.beforeImageUrl || ''}
                              alt=""
                              className="rounded"
                              style={{ width: 40, height: 40, objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{s.titleEn}</div>
                            <div className="text-muted small">{s.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="primary-subtle" text="primary">
                          {s.storyType}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {s.animalType || '—'}
                        {s.animalName ? ` (${s.animalName})` : ''}
                      </td>
                      <td>
                        {s.campaign && (
                          <div>
                            <Badge bg="info-subtle" text="info" style={{ fontSize: '10px' }}>
                              {s.campaign.titleEn}
                            </Badge>
                          </div>
                        )}
                        {s.purpose && (
                          <div>
                            <Badge bg="success-subtle" text="success" style={{ fontSize: '10px' }}>
                              {s.purpose.titleEn}
                            </Badge>
                          </div>
                        )}
                        {!s.campaign && !s.purpose && <span className="text-muted">—</span>}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Badge bg={s.isPublished ? 'success-subtle' : 'secondary-subtle'} text={s.isPublished ? 'success' : 'secondary'}>
                          {s.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td>{s.isFeatured ? <Icon icon="solar:star-bold" className="text-warning" /> : null}</td>
                      <td className="text-muted small">{s.storyDate ? new Date(s.storyDate).toLocaleDateString('en-GB') : '—'}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1 justify-content-end">
                          <Link href={`/donations/impact-stories/${s.id}`} className="btn btn-soft-primary btn-sm">
                            <Icon icon="solar:pen-bold" />
                          </Link>
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(s.id, s.titleEn)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
