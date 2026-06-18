'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, InputGroup, Row, Col, Nav, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import LocationSelector, { type LocationValue } from '@/components/location/LocationSelector'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { petsApi } from '@/lib/api/pets.api'
import type { ApiError } from '@/lib/api'
import type { Pet, PetOwner, PetType, PetGender } from '@/types/bpa.types'

type Tab = 'owners' | 'pets'

const PET_TYPES: PetType[] = ['dog', 'cat', 'bird', 'rabbit', 'other']
const PET_GENDERS: PetGender[] = ['male', 'female', 'unknown']

export default function PetsContent() {
  const { can } = usePermission()
  const [tab, setTab] = useState<Tab>('owners')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState<PetOwner | null>(null)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [ownerLocationValue, setOwnerLocationValue] = useState<LocationValue>({})
  const [petForm, setPetForm] = useState({ petOwnerId: '', name: '', species: 'dog' as PetType, breed: '', gender: 'unknown' as PetGender, dateOfBirth: '', weightKg: '', microchipNumber: '', notes: '' })
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const ownersFn = useCallback(() => petsApi.listOwners({ page, limit: 20, search: search || undefined }), [page, search])
  const petsFn = useCallback(() => petsApi.list({ page, limit: 20, search: search || undefined }), [page, search])

  const { data: ownersData, loading: lOwners, error: eOwners, refetch: rOwners } = useApi(tab === 'owners' ? ownersFn : null, [page, search, tab])
  const { data: petsData, loading: lPets, error: ePets, refetch: rPets } = useApi(tab === 'pets' ? petsFn : null, [page, search, tab])
  const ownersFull = useCallback(() => petsApi.listOwners({ limit: 200 }), [])
  const { data: allOwners } = useApi(ownersFull, [])

  function switchTab(t: Tab) { setTab(t); setPage(1); setSearch('') }

  function openCreateOwner() { setEditingOwner(null); setOwnerForm({ name: '', email: '', phone: '', address: '' }); setOwnerLocationValue({}); setShowModal(true) }
  function openEditOwner(o: PetOwner) {
    setEditingOwner(o)
    setOwnerForm({ name: o.name, email: o.email ?? '', phone: o.phone ?? '', address: o.address ?? '' })
    setOwnerLocationValue({
      divisionId: o.divisionId ?? undefined,
      districtId: o.districtId ?? undefined,
      upazilaId: o.upazilaId ?? undefined,
      unionId: o.unionId ?? undefined,
      cityCorporationId: o.cityCorporationId ?? undefined,
      cityZoneId: o.cityZoneId ?? undefined,
      wardId: o.wardId ?? undefined,
    })
    setShowModal(true)
  }
  function openCreatePet() { setEditingPet(null); setPetForm({ petOwnerId: '', name: '', species: 'dog', breed: '', gender: 'unknown', dateOfBirth: '', weightKg: '', microchipNumber: '', notes: '' }); setShowModal(true) }
  function openEditPet(p: Pet) { setEditingPet(p); setPetForm({ petOwnerId: p.petOwnerId, name: p.name, species: p.species, breed: p.breed ?? '', gender: p.gender, dateOfBirth: p.dateOfBirth ?? '', weightKg: p.weightKg ?? '', microchipNumber: p.microchipNumber ?? '', notes: p.notes ?? '' }); setShowModal(true) }

  async function handleSaveOwner() {
    if (!ownerForm.name.trim()) return
    const dto = {
      name: ownerForm.name,
      email: ownerForm.email || undefined,
      phone: ownerForm.phone || undefined,
      address: ownerForm.address || undefined,
      ...ownerLocationValue,
    }
    if (editingOwner) { await mutate(() => petsApi.updateOwner(editingOwner.id, dto), undefined) }
    else { await mutate(() => petsApi.createOwner(dto), undefined) }
    setShowModal(false); rOwners()
  }

  async function handleSavePet() {
    if (!petForm.name.trim() || !petForm.petOwnerId) return
    const dto = { petOwnerId: petForm.petOwnerId, name: petForm.name, species: petForm.species, breed: petForm.breed || undefined, gender: petForm.gender, dateOfBirth: petForm.dateOfBirth || undefined, weightKg: petForm.weightKg ? Number(petForm.weightKg) : undefined, microchipNumber: petForm.microchipNumber || undefined, notes: petForm.notes || undefined }
    if (editingPet) { await mutate(() => petsApi.update(editingPet.id, dto), undefined) }
    else { await mutate(() => petsApi.create(dto), undefined) }
    setShowModal(false); rPets()
  }

  async function handleDelete(id: string, type: Tab) {
    if (!confirm('Delete this record?')) return
    if (type === 'owners') { await mutate(() => petsApi.deleteOwner(id), undefined); rOwners() }
    else { await mutate(() => petsApi.remove(id), undefined); rPets() }
  }

  const owners = ownersData?.data ?? []
  const pets = petsData?.data ?? []
  const ownerMeta = ownersData?.meta ?? null
  const petMeta = petsData?.meta ?? null
  const loading = tab === 'owners' ? lOwners : lPets
  const apiError = tab === 'owners' ? eOwners : ePets

  return (
    <div className="container-fluid">
      <PageHeader
        title="Pets & Owners"
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Pets & Owners' }]}
        action={
          can(tab === 'owners' ? 'pet_owners:create' : 'pets:create') ? (
            <Button variant="primary" onClick={tab === 'owners' ? openCreateOwner : openCreatePet}>
              <Icon icon="solar:add-circle-bold" className="me-1" />
              {tab === 'owners' ? 'New Owner' : 'New Pet'}
            </Button>
          ) : undefined
        }
      />
      <ApiErrorAlert error={apiError as ApiError | null} />

      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link active={tab === 'owners'} onClick={() => switchTab('owners')}>Pet Owners</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link active={tab === 'pets'} onClick={() => switchTab('pets')}>Pets</Nav.Link></Nav.Item>
      </Nav>

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control placeholder={`Search ${tab}...`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </InputGroup>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            {tab === 'owners' ? (
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Owner</th><th>Phone</th><th>Pets</th><th className="text-end">Actions</th></tr>
                </thead>
                <tbody>
                  {owners.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-muted">No owners found</td></tr>
                  ) : owners.map((o: PetOwner) => (
                    <tr key={o.id}>
                      <td><div className="fw-semibold">{o.name}</div><div className="text-muted small">{o.email ?? '—'}</div></td>
                      <td>{o.phone ?? <span className="text-muted">—</span>}</td>
                      <td><Badge bg="primary-subtle" text="primary">{o._count?.pets ?? 0} pets</Badge></td>
                      <td className="text-end">
                        {can('pet_owners:update') && <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEditOwner(o)}><Icon icon="solar:pen-bold" /></Button>}
                        {can('pet_owners:delete') && <Button variant="soft-danger" size="sm" onClick={() => handleDelete(o.id, 'owners')}><Icon icon="solar:trash-bin-trash-bold" /></Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Pet</th><th>Species</th><th>Gender</th><th>Microchip</th><th>Status</th><th className="text-end">Actions</th></tr>
                </thead>
                <tbody>
                  {pets.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-muted">No pets found</td></tr>
                  ) : pets.map((p: Pet) => (
                    <tr key={p.id}>
                      <td><div className="fw-semibold">{p.name}</div><div className="text-muted small">{p.owner?.name ?? '—'}</div></td>
                      <td className="text-capitalize">{p.species}</td>
                      <td className="text-capitalize">{p.gender}</td>
                      <td>{p.microchipNumber ?? <span className="text-muted">—</span>}</td>
                      <td><span className={`badge bg-${p.isActive ? 'success' : 'secondary'}-subtle text-${p.isActive ? 'success' : 'secondary'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="text-end">
                        {can('pets:update') && <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEditPet(p)}><Icon icon="solar:pen-bold" /></Button>}
                        {can('pets:delete') && <Button variant="soft-danger" size="sm" onClick={() => handleDelete(p.id, 'pets')}><Icon icon="solar:trash-bin-trash-bold" /></Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </LoadingOverlay>

          {tab === 'owners' && ownerMeta && ownerMeta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{ownerMeta.total} owners · Page {ownerMeta.page} of {ownerMeta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!ownerMeta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!ownerMeta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
          {tab === 'pets' && petMeta && petMeta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{petMeta.total} pets · Page {petMeta.page} of {petMeta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!petMeta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!petMeta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Owner Modal */}
      {tab === 'owners' && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton><Modal.Title>{editingOwner ? 'Edit' : 'Add'} Pet Owner</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              {(['name', 'email', 'phone', 'address'] as const).map((f) => (
                <Form.Group className="mb-3" key={f}>
                  <Form.Label className="text-capitalize">{f}</Form.Label>
                  <Form.Control value={ownerForm[f]} onChange={(e) => setOwnerForm(o => ({ ...o, [f]: e.target.value }))} required={f === 'name'} />
                </Form.Group>
              ))}
              <Form.Label className="fw-semibold small mt-2">Location (Division / District / Upazila)</Form.Label>
              <LocationSelector
                value={ownerLocationValue}
                onChange={setOwnerLocationValue}
                showUnion={false}
                showCityCorporation={false}
                showZone={false}
                showWard={false}
                showAddressLine={false}
                locale="en"
              />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveOwner} disabled={saving}>{saving ? 'Saving…' : editingOwner ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Pet Modal */}
      {tab === 'pets' && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton><Modal.Title>{editingPet ? 'Edit' : 'Add'} Pet</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Owner</Form.Label>
                <Form.Select value={petForm.petOwnerId} onChange={(e) => setPetForm(f => ({ ...f, petOwnerId: e.target.value }))}>
                  <option value="">Select owner</option>
                  {(allOwners?.data ?? []).map((o: PetOwner) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Pet Name</Form.Label>
                <Form.Control value={petForm.name} onChange={(e) => setPetForm(f => ({ ...f, name: e.target.value }))} required />
              </Form.Group>
              <Row className="g-2 mb-3">
                <Col>
                  <Form.Label>Species</Form.Label>
                  <Form.Select value={petForm.species} onChange={(e) => setPetForm(f => ({ ...f, species: e.target.value as PetType }))}>
                    {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select value={petForm.gender} onChange={(e) => setPetForm(f => ({ ...f, gender: e.target.value as PetGender }))}>
                    {PET_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </Form.Select>
                </Col>
              </Row>
              <Row className="g-2 mb-3">
                <Col>
                  <Form.Label>Breed</Form.Label>
                  <Form.Control value={petForm.breed} onChange={(e) => setPetForm(f => ({ ...f, breed: e.target.value }))} />
                </Col>
                <Col>
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control type="number" step="0.1" value={petForm.weightKg} onChange={(e) => setPetForm(f => ({ ...f, weightKg: e.target.value }))} />
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" value={petForm.dateOfBirth} onChange={(e) => setPetForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Microchip Number</Form.Label>
                <Form.Control value={petForm.microchipNumber} onChange={(e) => setPetForm(f => ({ ...f, microchipNumber: e.target.value }))} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSavePet} disabled={saving}>{saving ? 'Saving…' : editingPet ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
