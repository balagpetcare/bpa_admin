'use client'

import { useCallback, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Card, Form, InputGroup, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi } from '@/hooks/useApi'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipCoveredPetsContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [search, setSearch] = useState('')
  const fetchFn = useCallback(() => membershipCampaignApi.listCoveredPets({ page, limit, search: search || undefined }), [page, limit, search])
  const { data, loading, error } = useApi(fetchFn, [search])
  return (
    <div className="container-fluid">
      <PageHeader title="Covered Pets" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Covered Pets' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <Icon icon="solar:magnifer-bold" />
            </InputGroup.Text>
            <Form.Control placeholder="Search membership number, card number, or pet..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Membership</th>
                  <th>Pet</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Linked</th>
                  <th>Clinic</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.membership?.membershipNumber ?? item.membership?.cardNumber ?? item.membershipId}</td>
                    <td>{item.pet?.name ?? item.petId}</td>
                    <td>{item.slotNumber}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{new Date(item.linkedAt).toLocaleString()}</td>
                    <td>{item.linkedAtClinic?.name ?? '-'}</td>
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
