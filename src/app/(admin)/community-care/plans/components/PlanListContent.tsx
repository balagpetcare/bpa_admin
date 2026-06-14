'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { contributionPlansApi } from '@/lib/api/contribution-plans.api'
import type { ApiError } from '@/lib/api'
import type { ContributionPlan } from '@/types/bpa.types'

export default function PlanListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(() => contributionPlansApi.list({ page, limit: 20 }), [page])
  const { data, loading, error, refetch } = useApi(fetchFn, [page])
  const plans = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this plan?')) return
    await mutate(() => contributionPlansApi.remove(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contribution Plans"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Plans' }]}
        action={
          can('contribution_plans:create') ? (
            <Link href="/community-care/plans/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />New Plan
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No plans found</td></tr>
                ) : plans.map((p: ContributionPlan) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/plans/${p.id}`)}>
                    <td>
                      <div className="fw-semibold">{p.title}</div>
                      <div className="text-muted small">{p.slug}</div>
                    </td>
                    <td><Badge bg="primary-subtle" text="primary">{p.contributionType.replace('_', ' ')}</Badge></td>
                    <td className="fw-semibold">৳{Number(p.amountBdt).toLocaleString()}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Badge bg={p.isActive ? 'success-subtle' : 'secondary-subtle'} text={p.isActive ? 'success' : 'secondary'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        {can('contribution_plans:read') && (
                          <Link href={`/community-care/plans/${p.id}`} className="btn btn-soft-primary btn-sm">
                            <Icon icon="solar:pen-bold" />
                          </Link>
                        )}
                        {can('contribution_plans:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(p.id)}>
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
              <small className="text-muted">{meta.total} plans · Page {meta.page} of {meta.totalPages}</small>
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
