'use client'

import { useCallback, useState } from 'react'
import { Card, Table, Badge, Button, Modal, Form, Alert, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { certificatesApi } from '@/lib/api/certificates.api'
import { usePermission } from '@/hooks/usePermission'
import type { ApiError } from '@/lib/api'
import type { Certificate } from '@/types/bpa.types'

export default function CertificatesManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [issueBookingId, setIssueBookingId] = useState('')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchNum, setSearchNum] = useState('')
  const [searchResult, setSearchResult] = useState<{ valid: boolean; certificate?: Certificate; message?: string } | null>(null)

  const { mutate, loading: mutating, error: mutateErr } = useApiMutation<Certificate, unknown>()

  const fetchFn = useCallback(
    () => certificatesApi.list({ campaignId, page, limit: 20 }),
    [campaignId, page],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [campaignId, page])

  const items = (data?.items ?? []) as Certificate[]
  const meta = data?.meta as { totalPages: number } | undefined

  async function handleIssue() {
    if (!issueBookingId.trim()) return
    await mutate(() => certificatesApi.issue(issueBookingId.trim()), undefined)
    setShowIssueModal(false)
    setIssueBookingId('')
    refetch()
  }

  async function handleReissue(petBookingId: string) {
    if (!confirm('Reissue certificate for this booking? The old certificate will be superseded.')) return
    await mutate(() => certificatesApi.reissue(petBookingId), undefined)
    refetch()
  }

  async function handleSearch() {
    const result = await certificatesApi.verifyByCertNumber(searchNum.trim())
    setSearchResult(result)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Certificates"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Certificates' },
        ]}
        action={
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-secondary" onClick={() => setShowSearchModal(true)}>
              <Icon icon="solar:magnifer-bold" className="me-1" />Search by Number
            </Button>
            {can('campaign_certificates:issue') && (
              <Button size="sm" variant="primary" onClick={() => setShowIssueModal(true)}>
                <Icon icon="solar:document-add-bold" className="me-1" />Issue Certificate
              </Button>
            )}
          </div>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />
      {mutateErr && <ApiErrorAlert error={mutateErr as ApiError} />}

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Certificate No.</th>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Issued At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No certificates issued yet</td></tr>
                ) : items.map(cert => (
                  <tr key={cert.id}>
                    <td><code className="small">{cert.certificateNumber}</code></td>
                    <td>
                      <div className="fw-semibold">{cert.petBooking.pet.name}</div>
                      <small className="text-muted text-capitalize">{cert.petBooking.pet.petType}</small>
                    </td>
                    <td>
                      <div>{cert.petBooking.pet.owner.ownerName}</div>
                      <small className="text-muted">{cert.petBooking.pet.owner.mobile}</small>
                    </td>
                    <td>{new Date(cert.issuedAt).toLocaleString()}</td>
                    <td>
                      {cert.supersededAt
                        ? <Badge bg="warning" text="dark">Superseded</Badge>
                        : <Badge bg="success">Active</Badge>
                      }
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <a
                          href={`/api/v1/public/campaigns/certificate-html/${cert.verifyToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-info"
                        >
                          <Icon icon="solar:eye-bold" className="me-1" />View
                        </a>
                        {can('campaign_certificates:issue') && !cert.supersededAt && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => handleReissue(cert.petBookingId)}
                            disabled={mutating}
                          >
                            <Icon icon="solar:refresh-bold" className="me-1" />Reissue
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Page {page} of {meta.totalPages}</small>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
            <Button size="sm" variant="outline-secondary" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      <Modal show={showIssueModal} onHide={() => setShowIssueModal(false)}>
        <Modal.Header closeButton><Modal.Title>Issue Certificate</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Pet Booking ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Paste pet booking UUID"
              value={issueBookingId}
              onChange={e => setIssueBookingId(e.target.value)}
            />
            <Form.Text className="text-muted">The booking must be in &quot;vaccinated&quot; status.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowIssueModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleIssue} disabled={mutating || !issueBookingId.trim()}>
            {mutating ? 'Issuing…' : 'Issue Certificate'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Search Modal */}
      <Modal show={showSearchModal} onHide={() => { setShowSearchModal(false); setSearchResult(null); setSearchNum('') }}>
        <Modal.Header closeButton><Modal.Title>Search Certificate</Modal.Title></Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="BPA-CERT-20260612-00001"
              value={searchNum}
              onChange={e => setSearchNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline-primary" onClick={handleSearch}>Search</Button>
          </InputGroup>
          {searchResult && (
            searchResult.valid && searchResult.certificate ? (
              <Alert variant="success">
                <div className="fw-bold">{searchResult.certificate.certificateNumber}</div>
                <div>Pet: {searchResult.certificate.petBooking.pet.name} ({searchResult.certificate.petBooking.pet.petType})</div>
                <div>Owner: {searchResult.certificate.petBooking.pet.owner.ownerName}</div>
                <div>Issued: {new Date(searchResult.certificate.issuedAt).toLocaleString()}</div>
                <div className="mt-2">
                  <a
                    href={`/api/v1/public/campaigns/certificate-html/${searchResult.certificate.verifyToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View Certificate
                  </a>
                </div>
              </Alert>
            ) : (
              <Alert variant="warning">{searchResult.message ?? 'Certificate not found.'}</Alert>
            )
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}
