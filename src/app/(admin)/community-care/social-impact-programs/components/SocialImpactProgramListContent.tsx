'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import SocialImpactProgramTypeBadge from './SocialImpactProgramTypeBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { socialImpactProgramsApi } from '@/lib/api/social-impact-programs.api'
import type { ApiError } from '@/lib/api'
import type { SocialImpactProgram, SocialImpactProgramType } from '@/types/bpa.types'

const IMPACT_TYPE_OPTIONS: { value: SocialImpactProgramType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'STRAY_TREATMENT', label: 'Stray Treatment' },
  { value: 'FEEDING', label: 'Feeding' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'RESCUE', label: 'Rescue' },
  { value: 'SHELTER', label: 'Shelter' },
  { value: 'LOW_INCOME_SUPPORT', label: 'Low-Income Support' },
  { value: 'EDUCATION', label: 'Education' },
]

export default function SocialImpactProgramListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [impactType, setImpactType] = useState<SocialImpactProgramType | ''>('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => socialImpactProgramsApi.list({ page, limit: 20, impactType: impactType || undefined }),
    [page, impactType],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, impactType])
  const items = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this program? This cannot be undone.')) return
    await mutate(() => socialImpactProgramsApi.remove(id), undefined)
    refetch()
  }

  async function handleToggleActive(item: SocialImpactProgram) {
    await mutate(() => socialImpactProgramsApi.update(item.id, { isActive: !item.isActive }), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Social Impact Programs"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Social Impact Programs' }]}
        action={
          can('social_impact_programs:create') ? (
            <Link href="/community-care/social-impact-programs/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />New Program
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select value={impactType} onChange={e => { setImpactType(e.target.value as SocialImpactProgramType | ''); setPage(1) }}>
                {IMPACT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Title</th>
                  <th>Impact Type</th>
                  <th>Icon</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No programs found</td></tr>
                ) : items.map((item: SocialImpactProgram) => (
                  <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/social-impact-programs/${item.id}`)}>
                    <td className="text-muted small">{item.sortOrder}</td>
                    <td>
                      <div className="fw-semibold">{item.titleEn}</div>
                      <div className="text-muted small">{item.titleBn}</div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <SocialImpactProgramTypeBadge impactType={item.impactType} />
                    </td>
                    <td>
                      {item.icon
                        ? <Icon icon={item.icon} width={20} className="text-muted" />
                        : <span className="text-muted small">—</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <Badge bg={item.isActive ? 'success-subtle' : 'secondary-subtle'} text={item.isActive ? 'success' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-end" onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        {can('social_impact_programs:update') && (
                          <>
                            <Link href={`/community-care/social-impact-programs/${item.id}`} className="btn btn-soft-primary btn-sm">
                              <Icon icon="solar:pen-bold" />
                            </Link>
                            <Button variant={item.isActive ? 'soft-warning' : 'soft-success'} size="sm" title={item.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(item)}>
                              <Icon icon={item.isActive ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                            </Button>
                          </>
                        )}
                        {can('social_impact_programs:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(item.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} programs · Page {meta.page} of {meta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
