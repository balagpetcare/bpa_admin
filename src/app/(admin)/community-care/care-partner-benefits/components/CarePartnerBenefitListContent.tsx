'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CarePartnerBenefitCategoryBadge from './CarePartnerBenefitCategoryBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { carePartnerBenefitsApi } from '@/lib/api/care-partner-benefits.api'
import type { ApiError } from '@/lib/api'
import type { CarePartnerBenefit, CarePartnerBenefitCategory } from '@/types/bpa.types'

const CATEGORY_OPTIONS: { value: CarePartnerBenefitCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'MEMBERSHIP', label: 'Membership' },
  { value: 'WELFARE', label: 'Welfare' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'FUTURE', label: 'Future' },
]

export default function CarePartnerBenefitListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<CarePartnerBenefitCategory | ''>('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => carePartnerBenefitsApi.list({ page, limit: 20, category: category || undefined }),
    [page, category],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, category])
  const items = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this benefit? This cannot be undone.')) return
    await mutate(() => carePartnerBenefitsApi.remove(id), undefined)
    refetch()
  }

  async function handleToggleActive(item: CarePartnerBenefit) {
    await mutate(() => carePartnerBenefitsApi.update(item.id, { isActive: !item.isActive }), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Care Partner Benefits"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Care Partner Benefits' }]}
        action={
          can('care_partner_benefits:create') ? (
            <Link href="/community-care/care-partner-benefits/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />New Benefit
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select
                value={category}
                onChange={e => { setCategory(e.target.value as CarePartnerBenefitCategory | ''); setPage(1) }}
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Icon</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No benefits found</td></tr>
                ) : items.map((item: CarePartnerBenefit) => (
                  <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/care-partner-benefits/${item.id}`)}>
                    <td className="text-muted small">{item.sortOrder}</td>
                    <td>
                      <div className="fw-semibold">{item.titleEn}</div>
                      <div className="text-muted small">{item.titleBn}</div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <CarePartnerBenefitCategoryBadge category={item.category} />
                    </td>
                    <td>
                      {item.icon
                        ? <Icon icon={item.icon} width={20} className="text-muted" />
                        : <span className="text-muted small">—</span>
                      }
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <Badge bg={item.isActive ? 'success-subtle' : 'secondary-subtle'} text={item.isActive ? 'success' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-end" onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        {can('care_partner_benefits:update') && (
                          <>
                            <Link href={`/community-care/care-partner-benefits/${item.id}`} className="btn btn-soft-primary btn-sm">
                              <Icon icon="solar:pen-bold" />
                            </Link>
                            <Button
                              variant={item.isActive ? 'soft-warning' : 'soft-success'}
                              size="sm"
                              title={item.isActive ? 'Deactivate' : 'Activate'}
                              onClick={() => handleToggleActive(item)}
                            >
                              <Icon icon={item.isActive ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                            </Button>
                          </>
                        )}
                        {can('care_partner_benefits:delete') && (
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
              <small className="text-muted">{meta.total} benefits · Page {meta.page} of {meta.totalPages}</small>
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
