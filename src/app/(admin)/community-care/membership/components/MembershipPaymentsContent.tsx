'use client'

import { useCallback, useMemo, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Card, Form, InputGroup, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi } from '@/hooks/useApi'
import { paymentsApi } from '@/lib/api/payments.api'
import { ApiError } from '@/lib/api'

export default function MembershipPaymentsContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [search, setSearch] = useState('')
  const fetchFn = useCallback(() => paymentsApi.list({ page, limit, search: search || undefined }), [page, limit, search])
  const { data, loading, error } = useApi(fetchFn, [search])
  const membershipPayments = useMemo(
    () => (data?.data ?? []).filter((item: any) => ['membership_campaign_application', 'membership_campaign_upgrade'].includes(item.purpose)),
    [data],
  )
  return (
    <div className="container-fluid">
      <PageHeader title="Payments" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Payments' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <Icon icon="solar:magnifer-bold" />
            </InputGroup.Text>
            <Form.Control placeholder="Search payment, transaction, or reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Purpose</th>
                  <th>Gateway</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {membershipPayments.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <div>{item.merchantTxnId ?? item.id}</div>
                      <div className="small text-muted">{item.gatewayRef ?? '-'}</div>
                    </td>
                    <td>{item.purpose}</td>
                    <td>{item.gateway}</td>
                    <td>
                      {item.amount} {item.currency}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {data?.meta && data.meta.totalPages > 1 && (
              <Pagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                totalPages={data.meta.totalPages}
                hasPrev={data.meta.hasPrev}
                hasNext={data.meta.hasNext}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
