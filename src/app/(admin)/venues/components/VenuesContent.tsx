'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Button, Badge, Form, Row, Col, Modal, InputGroup, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import EmptyState from '@/components/ui/EmptyState'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { locationTreeApi, locationsApi, type CreateVenueDto } from '@/lib/api/locations.api'
import LocationSelector, { type LocationValue } from '@/components/location/LocationSelector'
import type { ApiError } from '@/lib/api'
import type { LocationNode, Venue } from '@/types/bpa.types'

const EMPTY_VENUE_FORM = {
  name: '', address: '', googleMapsUrl: '', latitude: '', longitude: '',
  contactPerson: '', contactPhone: '', capacity: '', isActive: true,
}

// Deepest non-empty level chosen in the cascading selector is what the venue
// actually attaches to (the server denormalizes the rest of the ancestor
// chain automatically).
function deepestLocationId(v: LocationValue): string | undefined {
  return v.wardId || v.cityZoneId || v.cityCorporationId || v.unionId || v.upazilaId || v.districtId || v.divisionId
}

// The single reusable source of physical venue records. Campaign sessions
// select a venue from here rather than typing one in free text. Separate
// from Location Management, which only browses the administrative hierarchy.
export default function VenuesContent() {
  const { can } = usePermission()
  const searchParams = useSearchParams()
  const initialLocationId = searchParams.get('locationId') ?? ''

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState<LocationValue>({})
  const [scopedLocationId, setScopedLocationId] = useState(initialLocationId)
  const [scopedLocationLabel, setScopedLocationLabel] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [venueForm, setVenueForm] = useState(EMPTY_VENUE_FORM)
  const [venueLocation, setVenueLocation] = useState<LocationValue>({})
  const [formError, setFormError] = useState<string | null>(null)
  const { mutate: mutateVenue, loading: saving, error: venueError, clearError } = useApiMutation<Venue, unknown>()
  const { mutate: mutateDelete } = useApiMutation<void, unknown>()

  const [breadcrumbs, setBreadcrumbs] = useState<Record<string, LocationNode[]>>({})

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(h)
  }, [search])

  useEffect(() => {
    if (!scopedLocationId) { setScopedLocationLabel(null); return }
    locationTreeApi.getPath(scopedLocationId).then((path) => {
      setScopedLocationLabel(path.map((n) => n.nameEn).join(' › '))
    })
  }, [scopedLocationId])

  const venuesFn = useCallback(
    () => locationsApi.listVenues({
      search: debouncedSearch || undefined,
      locationId: scopedLocationId || undefined,
    }),
    [debouncedSearch, scopedLocationId],
  )
  const { data: venues, loading, error, refetch } = useApi(venuesFn, [debouncedSearch, scopedLocationId])
  const venueList: Venue[] = Array.isArray(venues) ? venues : []

  useEffect(() => {
    venueList
      .filter((v) => v.locationId && !breadcrumbs[v.locationId])
      .forEach((v) => {
        locationTreeApi.getPath(v.locationId!).then((path) => {
          setBreadcrumbs((prev) => ({ ...prev, [v.locationId!]: path }))
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueList])

  function openCreateModal() {
    setEditingVenue(null)
    setVenueForm(EMPTY_VENUE_FORM)
    setVenueLocation({})
    setFormError(null)
    clearError()
    setShowModal(true)
  }

  function openEditModal(v: Venue) {
    setEditingVenue(v)
    setVenueForm({
      name: v.name,
      address: v.address,
      googleMapsUrl: v.googleMapsUrl ?? '',
      latitude: v.latitude !== null ? String(v.latitude) : '',
      longitude: v.longitude !== null ? String(v.longitude) : '',
      contactPerson: v.contactPerson ?? '',
      contactPhone: v.contactPhone ?? '',
      capacity: v.capacity !== null && v.capacity !== undefined ? String(v.capacity) : '',
      isActive: v.isActive,
    })
    setVenueLocation({})
    setFormError(null)
    clearError()
    setShowModal(true)
  }

  async function handleSave() {
    setFormError(null)

    const name = venueForm.name.trim()
    const address = venueForm.address.trim()
    const locationId = editingVenue ? (deepestLocationId(venueLocation) ?? editingVenue.locationId ?? undefined) : deepestLocationId(venueLocation)

    if (!name) { setFormError('Venue name is required.'); return }
    if (!address) { setFormError('Full address is required.'); return }
    if (!locationId) { setFormError('Select a location (Division, District, Upazila, Union, City Corporation, Zone, or Ward) for this venue.'); return }

    let latitude: number | undefined
    if (venueForm.latitude.trim()) {
      latitude = Number(venueForm.latitude)
      if (Number.isNaN(latitude)) { setFormError('Latitude must be a valid number.'); return }
    }

    let longitude: number | undefined
    if (venueForm.longitude.trim()) {
      longitude = Number(venueForm.longitude)
      if (Number.isNaN(longitude)) { setFormError('Longitude must be a valid number.'); return }
    }

    let capacity: number | undefined
    if (venueForm.capacity.trim()) {
      capacity = Number(venueForm.capacity)
      if (Number.isNaN(capacity) || capacity <= 0) { setFormError('Capacity must be a positive number.'); return }
    }

    const dto: CreateVenueDto = {
      name,
      address,
      locationId,
      googleMapsUrl: venueForm.googleMapsUrl.trim() || undefined,
      latitude,
      longitude,
      contactPerson: venueForm.contactPerson.trim() || undefined,
      contactPhone: venueForm.contactPhone.trim() || undefined,
      capacity,
      isActive: venueForm.isActive,
    }

    clearError()
    const result = editingVenue
      ? await mutateVenue(() => locationsApi.updateVenue(editingVenue.id, dto), undefined)
      : await mutateVenue(() => locationsApi.createVenue(dto), undefined)

    if (result) {
      setShowModal(false)
      refetch()
    }
  }

  async function handleDeactivate(v: Venue) {
    const result = await mutateVenue(() => locationsApi.updateVenue(v.id, { isActive: !v.isActive }), undefined)
    if (result) refetch()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this venue? This will fail if campaign sessions are scheduled here.')) return
    const result = await mutateDelete(() => locationsApi.deleteVenue(id), undefined)
    if (result !== null) refetch()
  }

  const hasActiveFilter = Boolean(scopedLocationId && scopedLocationLabel)

  function clearFilters() {
    setLocationFilter({})
    setScopedLocationId('')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Venues"
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Venues' }]}
        action={can('locations:create') ? (
          <Button variant="primary" onClick={openCreateModal}>
            <Icon icon="solar:add-circle-bold" className="me-1" />Create Venue
          </Button>
        ) : undefined}
      />
      <p className="text-muted small mb-3">
        Reusable venue records that campaign sessions attach to.
      </p>

      {/* ── Filter panel ──────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="fw-semibold mb-3">Filter Venues</h6>

          <Row className="g-3 mb-1">
            <Col xs={12}>
              <Form.Label className="small fw-semibold text-muted">Search</Form.Label>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by venue name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <hr className="my-3" />

          <Form.Label className="small fw-semibold text-muted d-block mb-2">Area</Form.Label>
          <LocationSelector
            value={locationFilter}
            onChange={(v) => {
              setLocationFilter(v)
              setScopedLocationId(deepestLocationId(v) ?? '')
            }}
            showAddressLine={false}
            columnsMd={4}
          />

          {hasActiveFilter && (
            <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
              <span className="small text-muted">Active filter:</span>
              <Badge bg="primary-subtle" text="primary" className="fw-normal px-2 py-1">
                <Icon icon="solar:map-point-bold-duotone" className="me-1" />{scopedLocationLabel}
              </Badge>
              <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <ApiErrorAlert error={error as ApiError | null} />

      {/* ── Results ───────────────────────────────────────────────── */}
      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between bg-white">
          <span className="fw-semibold">Venue List</span>
          <span className="text-muted small">{venueList.length} venue{venueList.length !== 1 ? 's' : ''} found</span>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            {venueList.length === 0 ? (
              <EmptyState
                icon="solar:buildings-2-bold-duotone"
                title="No venues found for this area."
                description="Create a reusable venue and attach it to campaign sessions."
                action={can('locations:create') ? (
                  <Button variant="primary" size="sm" onClick={openCreateModal}>
                    <Icon icon="solar:add-circle-bold" className="me-1" />Create Venue
                  </Button>
                ) : undefined}
              />
            ) : (
            <div className="table-responsive">
              <table className="table table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Venue</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venueList.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className="fw-semibold">
                          {v.name}
                          {v.googleMapsUrl && (
                            <a href={v.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                              <Icon icon="solar:map-point-bold" className="text-primary" />
                            </a>
                          )}
                        </div>
                        <div className="text-muted small">{v.address}</div>
                      </td>
                      <td className="text-muted small">
                        {v.locationId ? (breadcrumbs[v.locationId]?.map((n) => n.nameEn).join(' › ') ?? '…') : '—'}
                      </td>
                      <td>
                        {v.contactPerson || v.contactPhone ? (
                          <span className="small">
                            {v.contactPerson}{v.contactPerson && v.contactPhone ? ' · ' : ''}{v.contactPhone}
                          </span>
                        ) : <span className="text-muted small">—</span>}
                      </td>
                      <td>{v.capacity ?? <span className="text-muted small">—</span>}</td>
                      <td>
                        <Badge bg={v.isActive ? 'success' : 'secondary'}>{v.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="text-end">
                        {can('locations:update') && (
                          <>
                            <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEditModal(v)} title="Edit">
                              <Icon icon="solar:pen-bold" />
                            </Button>
                            <Button variant="soft-secondary" size="sm" className="me-1" onClick={() => handleDeactivate(v)} title={v.isActive ? 'Deactivate' : 'Activate'}>
                              <Icon icon={v.isActive ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                            </Button>
                          </>
                        )}
                        {can('locations:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(v.id)} title="Delete">
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* Create / Edit Venue modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingVenue ? 'Edit Venue' : 'Create Venue'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={venueError as ApiError | null} onDismiss={clearError} />
          {formError && (
            <Alert variant="danger" dismissible onClose={() => setFormError(null)} className="py-2 small">
              {formError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Venue Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={venueForm.name}
              onChange={(e) => setVenueForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Ward 12 Community Health Camp"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Full Address <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={venueForm.address}
              onChange={(e) => setVenueForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="House/road, area, city"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Location <span className="text-danger">*</span>
              {editingVenue && <span className="text-muted fw-normal ms-1">(leave unset to keep current location)</span>}
            </Form.Label>
            <LocationSelector value={venueLocation} onChange={setVenueLocation} showAddressLine={false} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Google Maps Link</Form.Label>
            <Form.Control
              type="url"
              value={venueForm.googleMapsUrl}
              onChange={(e) => setVenueForm((f) => ({ ...f, googleMapsUrl: e.target.value }))}
              placeholder="https://maps.google.com/…"
            />
          </Form.Group>
          <Row className="g-2 mb-3">
            <Col>
              <Form.Label className="fw-semibold">Latitude</Form.Label>
              <Form.Control
                type="number" step="any"
                value={venueForm.latitude}
                onChange={(e) => setVenueForm((f) => ({ ...f, latitude: e.target.value }))}
                placeholder="23.7806"
              />
            </Col>
            <Col>
              <Form.Label className="fw-semibold">Longitude</Form.Label>
              <Form.Control
                type="number" step="any"
                value={venueForm.longitude}
                onChange={(e) => setVenueForm((f) => ({ ...f, longitude: e.target.value }))}
                placeholder="90.4193"
              />
            </Col>
          </Row>
          <Row className="g-2 mb-3">
            <Col>
              <Form.Label className="fw-semibold">Contact Person</Form.Label>
              <Form.Control
                value={venueForm.contactPerson}
                onChange={(e) => setVenueForm((f) => ({ ...f, contactPerson: e.target.value }))}
                placeholder="Name"
              />
            </Col>
            <Col>
              <Form.Label className="fw-semibold">Contact Phone</Form.Label>
              <Form.Control
                value={venueForm.contactPhone}
                onChange={(e) => setVenueForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="01XXXXXXXXX"
              />
            </Col>
          </Row>
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Label className="fw-semibold">Capacity</Form.Label>
              <Form.Control
                type="number" min={1}
                value={venueForm.capacity}
                onChange={(e) => setVenueForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="e.g. 200"
              />
            </Col>
          </Row>
          <Form.Check
            type="switch"
            label="Active (visible for campaign sessions and public booking)"
            checked={venueForm.isActive}
            onChange={(e) => setVenueForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editingVenue ? 'Update Venue' : 'Create Venue'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
