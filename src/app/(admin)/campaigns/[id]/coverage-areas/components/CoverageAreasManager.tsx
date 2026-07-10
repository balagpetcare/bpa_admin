'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi, type CampaignCoverage } from '@/lib/api/campaigns.api'
import { locationTreeApi } from '@/lib/api/locations.api'
import type { ApiError } from '@/lib/api'
import type { LocationNode, LocationNodeType } from '@/types/bpa.types'

// Levels an admin can assign coverage at, in specific-to-broad order for the
// select. Nationwide is modeled separately (no location node).
const COVERAGE_LEVELS: { value: LocationNodeType; label: string }[] = [
  { value: 'DIVISION', label: 'Division' },
  { value: 'DISTRICT', label: 'District' },
  { value: 'UPAZILA', label: 'Upazila' },
  { value: 'UNION', label: 'Union' },
  { value: 'CITY_CORPORATION', label: 'City Corporation' },
  { value: 'CITY_ZONE', label: 'Zone' },
  { value: 'WARD', label: 'Ward' },
]

const TYPE_LABEL: Record<string, string> = {
  DIVISION: 'Division', DISTRICT: 'District', UPAZILA: 'Upazila', THANA: 'Thana',
  UNION: 'Union', POURASHAVA: 'Pourashava', CITY_CORPORATION: 'City Corporation',
  CITY_ZONE: 'Zone', WARD: 'Ward', AREA: 'Area',
}

// Only these levels are specific enough to host a venue directly.
const VENUE_ELIGIBLE_TYPES: LocationNodeType[] = [
  'UPAZILA', 'THANA', 'UNION', 'POURASHAVA', 'CITY_CORPORATION', 'CITY_ZONE', 'WARD', 'AREA',
]

export default function CoverageAreasManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const canManage = can('campaigns:update')

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Record<string, LocationNode[]>>({})

  // ── Add coverage form ──────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false)
  const [isNationwide, setIsNationwide] = useState(false)
  const [level, setLevel] = useState<LocationNodeType>('DIVISION')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchResults, setSearchResults] = useState<LocationNode[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null)

  const { mutate, loading: saving, error: mutationError, clearError } = useApiMutation<unknown, unknown>()

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(h)
  }, [search])

  useEffect(() => {
    if (!debouncedSearch.trim() || isNationwide) { setSearchResults([]); return }
    setSearching(true)
    locationTreeApi.search(debouncedSearch.trim(), level)
      .then((results) => setSearchResults(results))
      .finally(() => setSearching(false))
  }, [debouncedSearch, level, isNationwide])

  const coveragesFn = useCallback(() => campaignsApi.listCoverages(campaignId), [campaignId])
  const { data: coverages, loading, error, refetch } = useApi(coveragesFn, [campaignId])
  const coverageList: CampaignCoverage[] = Array.isArray(coverages) ? coverages : []

  // Resolve breadcrumb paths for each covered location once loaded.
  useEffect(() => {
    coverageList
      .filter((c) => c.location && !breadcrumbs[c.location.id])
      .forEach((c) => {
        locationTreeApi.getPath(c.location!.id).then((path) => {
          setBreadcrumbs((prev) => ({ ...prev, [c.location!.id]: path }))
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverageList])

  function openAddModal() {
    setIsNationwide(false); setLevel('DIVISION'); setSearch(''); setSearchResults([])
    setSelectedNode(null); setSuccessMsg(null); clearError()
    setShowAddModal(true)
  }

  async function handleAddCoverage() {
    setSuccessMsg(null); clearError()
    const dto = isNationwide ? { isNationwide: true } : { locationId: selectedNode?.id }
    const result = await mutate(() => campaignsApi.addCoverage(campaignId, dto), undefined)
    if (result) {
      setShowAddModal(false)
      setSuccessMsg('Coverage added.')
      refetch()
    }
  }

  async function handleRemoveCoverage(coverageId: string) {
    if (!confirm('Remove this coverage area? The campaign will no longer be discoverable there.')) return
    setSuccessMsg(null); clearError()
    const result = await mutate(() => campaignsApi.removeCoverage(campaignId, coverageId), undefined)
    if (result !== null) {
      setSuccessMsg('Coverage removed.')
      refetch()
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Coverage Areas"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Coverage Areas' },
        ]}
        action={canManage ? (
          <Button variant="primary" onClick={openAddModal}>
            <Icon icon="solar:add-circle-bold" className="me-1" />Add Coverage
          </Button>
        ) : undefined}
      />

      <Alert variant="info" className="d-flex align-items-start gap-2 py-2 small">
        <Icon icon="solar:info-circle-bold" style={{ fontSize: 18, flexShrink: 0 }} className="mt-1" />
        <div>
          Public visitors pick their location first (Union/Upazila/District/Division or Ward/Zone/City Corporation),
          and see this campaign if it covers that exact area <strong>or the nearest broader area you assign here</strong>.
          A campaign with no coverage anywhere is invisible on the public site.
        </div>
      </Alert>

      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>
      )}
      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Level</th>
                  <th>Area</th>
                  <th>Path</th>
                  <th>Status</th>
                  {canManage && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {coverageList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-5 text-muted">
                    <Icon icon="solar:map-point-wave-bold-duotone" style={{ fontSize: 40, opacity: 0.3 }} />
                    <div className="mt-2">No coverage areas assigned yet — this campaign is not discoverable on the public site.</div>
                    {canManage && <Button variant="outline-primary" size="sm" className="mt-2" onClick={openAddModal}>Add first coverage area</Button>}
                  </td></tr>
                ) : coverageList.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Badge bg={c.isNationwide ? 'dark' : 'primary-subtle'} text={c.isNationwide ? undefined : 'primary'}>
                        {c.isNationwide ? 'Nationwide' : TYPE_LABEL[c.location?.type ?? ''] ?? c.location?.type}
                      </Badge>
                    </td>
                    <td className="fw-semibold">{c.isNationwide ? 'All of Bangladesh' : c.location?.nameEn}</td>
                    <td className="text-muted small">
                      {c.isNationwide ? '—' : (breadcrumbs[c.location?.id ?? '']?.map((n) => n.nameEn).join(' > ') ?? '…')}
                    </td>
                    <td>
                      <Badge bg={c.isNationwide || true ? 'success-subtle' : 'secondary-subtle'} text={c.isNationwide || true ? 'success' : 'secondary'}>
                        Active
                      </Badge>
                    </td>
                    {canManage && (
                      <td className="text-end">
                        {!c.isNationwide && c.location && VENUE_ELIGIBLE_TYPES.includes(c.location.type) && (
                          <Link href={`/venues?locationId=${c.location.id}`} className="btn btn-outline-secondary btn-sm me-1" title="Manage venues here">
                            <Icon icon="solar:buildings-2-bold-duotone" className="me-1" />Venues
                          </Link>
                        )}
                        <Button variant="soft-danger" size="sm" onClick={() => handleRemoveCoverage(c.id)} title="Remove">
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* ── Add Coverage Modal ─────────────────────────────────────── */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Coverage Area</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="isNationwide"
              label="Nationwide (visible everywhere in Bangladesh)"
              checked={isNationwide}
              onChange={(e) => { setIsNationwide(e.target.checked); setSelectedNode(null) }}
            />
          </Form.Group>

          {!isNationwide && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Level</Form.Label>
                <Form.Select value={level} onChange={(e) => { setLevel(e.target.value as LocationNodeType); setSelectedNode(null); setSearchResults([]) }}>
                  {COVERAGE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Search &amp; Select Area <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder={`Search existing ${COVERAGE_LEVELS.find((l) => l.value === level)?.label} by name…`}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedNode(null) }}
                  autoFocus
                />
                <div className="border rounded bg-light p-2 mt-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {searching ? (
                    <div className="text-center text-muted py-3 small"><span className="spinner-border spinner-border-sm me-2" />Searching…</div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center text-muted py-3 small">
                      {search.trim() ? 'No matching area found.' : 'Type to search existing areas.'}
                    </div>
                  ) : searchResults.map((n) => (
                    <button key={n.id} type="button"
                      className={`list-group-item list-group-item-action border-0 rounded mb-1 py-2 text-start w-100 ${selectedNode?.id === n.id ? 'active bg-primary text-white' : ''}`}
                      onClick={() => setSelectedNode(n)}
                    >
                      <div className="fw-semibold">{n.nameEn}{n.nameBn ? ` (${n.nameBn})` : ''}</div>
                    </button>
                  ))}
                </div>
                <Form.Text className="text-muted">
                  This only selects an existing area from the location tree — new Divisions/Districts/Upazilas/Unions are created in the Locations admin section, never here.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddCoverage} disabled={saving || (!isNationwide && !selectedNode)}>
            {saving ? 'Saving…' : 'Add Coverage'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
