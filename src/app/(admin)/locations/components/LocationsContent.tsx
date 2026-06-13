'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { locationsApi } from '@/lib/api/locations.api'
import type { ApiError } from '@/lib/api'
import type { Country, Division, District, CityCorporation, Zone, Venue } from '@/types/bpa.types'

interface LocationRow { id: string; name: string; subtitle?: string; isActive?: boolean }

type ActiveLevel = 'countries' | 'divisions' | 'districts' | 'city-corporations' | 'zones' | 'venues'

const LEVELS: { key: ActiveLevel; label: string; icon: string }[] = [
  { key: 'countries', label: 'Countries', icon: 'solar:earth-bold-duotone' },
  { key: 'divisions', label: 'Divisions', icon: 'solar:map-bold-duotone' },
  { key: 'districts', label: 'Districts', icon: 'solar:map-point-bold-duotone' },
  { key: 'city-corporations', label: 'City Corps', icon: 'solar:buildings-bold-duotone' },
  { key: 'zones', label: 'Zones', icon: 'solar:layers-minimalistic-bold-duotone' },
  { key: 'venues', label: 'Venues', icon: 'solar:home-2-bold-duotone' },
]

export default function LocationsContent() {
  const { can } = usePermission()
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('countries')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formParentId, setFormParentId] = useState('')
  const { mutate, loading: saving, error: mutateError } = useApiMutation<unknown, unknown>()

  // Fetch data for each level
  const countriesFn = useCallback(() => locationsApi.listCountries(), [])
  const divisionsFn = useCallback(() => locationsApi.listDivisions(), [])
  const districtsFn = useCallback(() => locationsApi.listDistricts(), [])
  const citycorpsFn = useCallback(() => locationsApi.listCityCorporations(), [])
  const zonesFn = useCallback(() => locationsApi.listZones(), [])
  const venuesFn = useCallback(() => locationsApi.listVenues(), [])

  const { data: countries, loading: lCountries, error: eCountries, refetch: rCountries } = useApi(countriesFn, [])
  const { data: divisions, loading: lDivisions, refetch: rDivisions } = useApi(divisionsFn, [])
  const { data: districts, loading: lDistricts, refetch: rDistricts } = useApi(districtsFn, [])
  const { data: citycorps, loading: lCitycorps, refetch: rCitycorps } = useApi(citycorpsFn, [])
  const { data: zones, loading: lZones, refetch: rZones } = useApi(zonesFn, [])
  const { data: venues, loading: lVenues, refetch: rVenues } = useApi(venuesFn, [])

  const refetchMap: Record<ActiveLevel, () => void> = {
    countries: rCountries, divisions: rDivisions, districts: rDistricts,
    'city-corporations': rCitycorps, zones: rZones, venues: rVenues,
  }
  const loadingMap: Record<ActiveLevel, boolean> = {
    countries: lCountries, divisions: lDivisions, districts: lDistricts,
    'city-corporations': lCitycorps, zones: lZones, venues: lVenues,
  }

  const getRows = (): LocationRow[] => {
    switch (activeLevel) {
      case 'countries': return (countries ?? []).map((c: Country) => ({ id: c.id, name: c.name, subtitle: c.code }))
      case 'divisions': return (divisions ?? []).map((d: Division) => ({ id: d.id, name: d.name }))
      case 'districts': return (districts ?? []).map((d: District) => ({ id: d.id, name: d.name }))
      case 'city-corporations': return (citycorps ?? []).map((c: CityCorporation) => ({ id: c.id, name: c.name }))
      case 'zones': return (zones ?? []).map((z: Zone) => ({ id: z.id, name: z.name }))
      case 'venues': return (venues ?? []).map((v: Venue) => ({ id: v.id, name: v.name, subtitle: v.address ?? undefined, isActive: v.isActive }))
    }
  }

  const getParentOptions = (): { id: string; name: string }[] => {
    switch (activeLevel) {
      case 'divisions': return countries ?? []
      case 'districts': return divisions ?? []
      case 'city-corporations': return districts ?? []
      case 'zones': return citycorps ?? []
      case 'venues': return zones ?? []
      default: return []
    }
  }

  const parentLabel: Record<ActiveLevel, string> = {
    countries: '', divisions: 'Country', districts: 'Division',
    'city-corporations': 'District', zones: 'City Corp', venues: 'Zone',
  }

  function openCreate() {
    setEditing(null); setFormName(''); setFormCode(''); setFormAddress(''); setFormParentId(''); setShowModal(true)
  }
  function openEdit(row: LocationRow) {
    setEditing({ id: row.id, name: row.name })
    setFormName(row.name)
    setFormCode(activeLevel === 'countries' ? (row.subtitle ?? '') : '')
    setFormAddress(activeLevel === 'venues' ? (row.subtitle ?? '') : '')
    setShowModal(true)
  }

  async function handleSave() {
    if (!formName.trim()) return
    if (activeLevel === 'venues' && !editing && !formAddress.trim()) return
    let result: unknown = null
    if (editing) {
      result = await mutate(() => {
        switch (activeLevel) {
          case 'countries': return locationsApi.updateCountry(editing.id, { name: formName, code: formCode || undefined })
          case 'divisions': return locationsApi.updateDivision(editing.id, { name: formName })
          case 'districts': return locationsApi.updateDistrict(editing.id, { name: formName })
          case 'city-corporations': return locationsApi.updateCityCorporation(editing.id, { name: formName })
          case 'zones': return locationsApi.updateZone(editing.id, { name: formName })
          case 'venues': return locationsApi.updateVenue(editing.id, { name: formName, address: formAddress || undefined })
        }
      }, undefined)
    } else {
      result = await mutate(() => {
        switch (activeLevel) {
          case 'countries': return locationsApi.createCountry({ name: formName, code: formCode })
          case 'divisions': return locationsApi.createDivision({ name: formName, countryId: formParentId })
          case 'districts': return locationsApi.createDistrict({ name: formName, divisionId: formParentId })
          case 'city-corporations': return locationsApi.createCityCorporation({ name: formName, districtId: formParentId })
          case 'zones': return locationsApi.createZone({ name: formName, cityCorporationId: formParentId })
          case 'venues': return locationsApi.createVenue({ name: formName, zoneId: formParentId, address: formAddress })
        }
      }, undefined)
    }
    if (result !== null) {
      setShowModal(false)
      refetchMap[activeLevel]()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this location? This will fail if child records exist.')) return
    const result = await mutate(() => {
      switch (activeLevel) {
        case 'countries': return locationsApi.deleteCountry(id)
        case 'divisions': return locationsApi.deleteDivision(id)
        case 'districts': return locationsApi.deleteDistrict(id)
        case 'city-corporations': return locationsApi.deleteCityCorporation(id)
        case 'zones': return locationsApi.deleteZone(id)
        case 'venues': return locationsApi.deleteVenue(id)
      }
    }, undefined)
    // mutate returns null on error (error is shown via mutateError), so only refetch on success
    if (result !== null) refetchMap[activeLevel]()
  }

  const rows = getRows()
  const parentOptions = getParentOptions()
  const needsParent = activeLevel !== 'countries'
  const isLoading = loadingMap[activeLevel]

  return (
    <div className="container-fluid">
      <PageHeader
        title="Locations"
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Locations' }]}
        action={
          can('locations:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold" className="me-1" />
              Add {LEVELS.find(l => l.key === activeLevel)?.label.slice(0, -1)}
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={mutateError ?? (eCountries as ApiError | null)} />

      {/* Level tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {LEVELS.map((l) => (
          <Button
            key={l.key}
            variant={activeLevel === l.key ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setActiveLevel(l.key)}
          >
            <Icon icon={l.icon} className="me-1" />
            {l.label}
          </Button>
        ))}
      </div>

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={isLoading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  {(activeLevel === 'countries' || activeLevel === 'venues') && <th>Details</th>}
                  {activeLevel === 'venues' && <th>Status</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-muted">No records found</td></tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.name}</td>
                      {(activeLevel === 'countries' || activeLevel === 'venues') && (
                        <td><span className="text-muted small">{row.subtitle ?? '—'}</span></td>
                      )}
                      {activeLevel === 'venues' && (
                        <td>
                          <Badge bg={row.isActive !== false ? 'success' : 'secondary'}>
                            {row.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      )}
                      <td className="text-end">
                        {can('locations:update') && (
                          <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEdit(row)}>
                            <Icon icon="solar:pen-bold" />
                          </Button>
                        )}
                        {can('locations:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(row.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit' : 'Add'} {LEVELS.find(l => l.key === activeLevel)?.label.slice(0, -1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter name" />
            </Form.Group>
            {activeLevel === 'countries' && (
              <Form.Group className="mb-3">
                <Form.Label>Country Code</Form.Label>
                <Form.Control value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="e.g. BD" maxLength={10} />
              </Form.Group>
            )}
            {activeLevel === 'venues' && (
              <Form.Group className="mb-3">
                <Form.Label>Address {!editing && <span className="text-danger">*</span>}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Enter venue address"
                />
              </Form.Group>
            )}
            {needsParent && !editing && parentOptions.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>{parentLabel[activeLevel]}</Form.Label>
                <Form.Select value={formParentId} onChange={(e) => setFormParentId(e.target.value)}>
                  <option value="">Select {parentLabel[activeLevel]}</option>
                  {parentOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
