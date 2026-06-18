'use client'

import { useCallback } from 'react'
import { Card, Button, Table, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { listPurposes, deletePurpose, type DonationPurpose } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

export default function PurposeListContent() {
  const router = useRouter()
  const { mutate } = useApiMutation<unknown, unknown>()

  const fn = useCallback(() => listPurposes(), [])
  const { data: purposes, loading, error, refetch } = useApi(fn, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete purpose "${title}"? Existing donations will not be affected.`)) return
    await mutate(() => deletePurpose(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Donation Purposes"
        breadcrumbs={[{ label: 'Donations' }, { label: 'Purposes' }]}
        action={
          <Link href="/donations/purposes/create" className="btn btn-primary btn-sm">
            <Icon icon="solar:add-circle-bold" className="me-1" />New Purpose
          </Link>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Purpose</th>
                  <th>Icon</th>
                  <th>Suggested Amounts</th>
                  <th>Active</th>
                  <th>Sort</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(purposes ?? []).length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No purposes found.</td></tr>
                ) : (
                  (purposes ?? []).map((p: DonationPurpose, idx: number) => (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/donations/purposes/${p.id}`)}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{p.titleEn}</div>
                        {p.titleBn && <div className="text-muted small">{p.titleBn}</div>}
                        <div className="text-muted" style={{ fontSize: '11px' }}>{p.slug}</div>
                      </td>
                      <td>
                        {p.icon
                          ? <span className="badge bg-light text-dark font-monospace">{p.icon}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {p.suggestedAmounts?.length
                          ? p.suggestedAmounts.map((a) => (
                              <Badge key={a} bg="light" text="dark" className="me-1">৳{a.toLocaleString()}</Badge>
                            ))
                          : <span className="text-muted small">—</span>}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Badge bg={p.isActive ? 'success-subtle' : 'secondary-subtle'} text={p.isActive ? 'success' : 'secondary'}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-muted small">{p.sortOrder}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1 justify-content-end">
                          <Link href={`/donations/purposes/${p.id}`} className="btn btn-soft-primary btn-sm" title="Edit">
                            <Icon icon="solar:pen-bold" />
                          </Link>
                          <Button variant="soft-danger" size="sm" title="Delete" onClick={() => handleDelete(p.id, p.titleEn)}>
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
