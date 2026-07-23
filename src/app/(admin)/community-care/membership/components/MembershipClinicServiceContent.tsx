'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAllPages } from '@/utils/pagination'
import { useSession } from 'next-auth/react'
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { ApiError } from '@/lib/api'
import { doctorsApi } from '@/lib/api/doctors.api'
import { locationsApi } from '@/lib/api/locations.api'
import {
  membershipCampaignApi,
  membershipClinicApi,
  type ClinicMembershipDetail,
  type ClinicMembershipPet,
  type ClinicMembershipPetsResponse,
  type ClinicMembershipSummary,
} from '@/lib/api/membership-campaign.api'
import { usersApi } from '@/lib/api/users.api'
import type { AdminUser, Doctor, Venue } from '@/types/bpa.types'

type LookupMode = 'qrToken' | 'membershipNumber' | 'cardNumber' | 'mobile' | 'email'
type ReplacementReason = 'DECEASED' | 'PERMANENTLY_LOST'

const LOOKUP_LABELS: Record<LookupMode, string> = {
  qrToken: 'Scan QR',
  membershipNumber: 'Membership number',
  cardNumber: 'Card number',
  mobile: 'Mobile number',
  email: 'Email',
}

const COVERAGE_LABELS: Record<string, { label: string; variant: string }> = {
  ACTIVE: { label: 'Covered', variant: 'success' },
  NOT_COVERED: { label: 'Not covered', variant: 'secondary' },
  REPLACEMENT_PENDING: { label: 'Replacement pending', variant: 'warning' },
  DECEASED: { label: 'Deceased', variant: 'dark' },
  LOST: { label: 'Lost', variant: 'danger' },
  REPLACED: { label: 'Replaced', variant: 'info' },
}

const PET_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'other']
const PET_GENDERS = ['male', 'female', 'unknown']
const PERMANENT_LINK_MESSAGE =
  'This pet will be permanently linked to this membership and will use one pet slot. It cannot be removed later except through an approved deceased or permanently lost replacement process.'

function getCoverageMeta(pet: ClinicMembershipPet) {
  if (!pet.isCovered) return COVERAGE_LABELS.NOT_COVERED
  if (pet.coveredStatus && COVERAGE_LABELS[pet.coveredStatus]) return COVERAGE_LABELS[pet.coveredStatus]
  return COVERAGE_LABELS.ACTIVE
}

function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—'
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('DD MMM YYYY') : '—'
}

function asCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `৳${Number(value).toLocaleString('en-BD')}`
}

export default function MembershipClinicServiceContent() {
  const { data: session } = useSession()
  const { can } = usePermission()
  const [clinicId, setClinicId] = useState('')
  const [lookupMode, setLookupMode] = useState<LookupMode>('qrToken')
  const [lookupValue, setLookupValue] = useState('')
  const [lookupResult, setLookupResult] = useState<ClinicMembershipSummary | null>(null)
  const [membershipDetail, setMembershipDetail] = useState<ClinicMembershipDetail | null>(null)
  const [petData, setPetData] = useState<ClinicMembershipPetsResponse | null>(null)
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState<ClinicMembershipPet | null>(null)
  const [showReplacementModal, setShowReplacementModal] = useState<ClinicMembershipPet | null>(null)
  const [showCreatePetModal, setShowCreatePetModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState<ClinicMembershipPet | null>(null)
  const [pendingServicePetId, setPendingServicePetId] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const [newPetForm, setNewPetForm] = useState({
    name: '',
    petType: 'dog',
    gender: 'unknown',
    approxAge: '',
    breed: '',
    color: '',
    weightKg: '',
    notes: '',
  })
  const [serviceForm, setServiceForm] = useState({
    benefitId: '',
    serviceCode: '',
    serviceName: '',
    staffId: '',
    doctorId: '',
    regularPrice: '',
    discountAmount: '',
    payableAmount: '',
    notes: '',
  })
  const [replacementReason, setReplacementReason] = useState<ReplacementReason>('DECEASED')
  const [replacementNotes, setReplacementNotes] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () => setOnline(window.navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const venuesFn = useCallback(() => locationsApi.listVenues({ isActive: true }), [])
  const doctorsFn = useCallback(() => fetchAllPages((p, l) => doctorsApi.list({ page: p, limit: l, isActive: true })).then((d) => ({ data: d })), [])
  const staffFn = useCallback(() => fetchAllPages((p, l) => usersApi.list({ page: p, limit: l, isActive: true })).then((d) => ({ data: d })), [])
  const benefitsFn = useCallback(
    () => fetchAllPages((p, l) => membershipCampaignApi.listBenefits({ page: p, limit: l })).then((d) => ({ data: d })),
    [],
  )
  const { data: venues } = useApi(venuesFn, [])
  const { data: doctors } = useApi(doctorsFn, [])
  const { data: staffUsers } = useApi(staffFn, [])
  const { data: benefitData } = useApi(benefitsFn, [])

  const { mutate: mutateLookup, error: lookupMutationError, clearError: clearLookupMutationError } = useApiMutation<ClinicMembershipSummary, void>()
  const { mutate: mutateLink, loading: linking, error: linkError, clearError: clearLinkError } = useApiMutation<unknown, void>()
  const {
    mutate: mutateCreatePet,
    loading: creatingPet,
    error: createPetError,
    clearError: clearCreatePetError,
  } = useApiMutation<ClinicMembershipPet, void>()
  const { mutate: mutateServiceUsage, loading: savingService, error: serviceError, clearError: clearServiceError } = useApiMutation<unknown, void>()
  const {
    mutate: mutateReplacement,
    loading: savingReplacement,
    error: replacementError,
    clearError: clearReplacementError,
  } = useApiMutation<unknown, void>()

  const clinicOptions = (venues ?? []).map((item: Venue) => ({
    id: item.id,
    label: item.name,
    subLabel: item.address,
  }))
  const doctorOptions = (doctors?.data ?? []) as Doctor[]
  const staffOptions = (staffUsers?.data ?? []) as AdminUser[]
  const benefits = benefitData?.data ?? []

  const loadMembershipContext = useCallback(
    async (summary: ClinicMembershipSummary) => {
      const [detail, pets] = await Promise.all([
        membershipClinicApi.getMembership(summary.id, clinicId),
        membershipClinicApi.getMembershipPets(summary.id, clinicId),
      ])
      setLookupResult(summary)
      setMembershipDetail(detail)
      setPetData(pets)
    },
    [clinicId],
  )

  const selectedBenefits = useMemo(() => benefits, [benefits])

  const linkedPetsCount = petData?.pets.filter((pet) => pet.isCovered).length ?? 0
  const availableBenefitsCount = selectedBenefits.length
  const ownerName = lookupResult?.owner.applicantName ?? petData?.owner.ownerName ?? '—'
  const ownerEmail = lookupResult?.owner.email ?? petData?.owner.email ?? null
  const ownerMobile = lookupResult?.owner.mobile ?? petData?.owner.mobile ?? null
  const ownerAvatar = ownerEmail
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=0D8ABC&color=fff`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=4F46E5&color=fff`
  const selectedPet = showServiceModal

  async function handleLookup() {
    if (!clinicId || !lookupValue.trim()) return
    setLoadingLookup(true)
    clearLookupMutationError()
    setLookupResult(null)
    setMembershipDetail(null)
    setPetData(null)
    const payload = {
      clinicId,
      [lookupMode]: lookupValue.trim(),
    } as Record<string, string>
    const summary = await mutateLookup(() => membershipClinicApi.lookupMembership(payload as any), undefined)
    if (summary) {
      await loadMembershipContext(summary)
    }
    setLoadingLookup(false)
  }

  async function refreshMembership() {
    if (lookupResult) await loadMembershipContext(lookupResult)
  }

  async function handleConfirmLink() {
    if (!showLinkModal || !lookupResult) return
    clearLinkError()
    const result = await mutateLink(() => membershipClinicApi.linkCoveredPet(lookupResult.id, clinicId, showLinkModal.id), undefined)
    if (result) {
      const linkedPetId = showLinkModal.id
      setShowLinkModal(null)
      await refreshMembership()
      if (pendingServicePetId === linkedPetId) {
        const pet = (petData?.pets ?? []).find((item) => item.id === linkedPetId)
        if (pet) setShowServiceModal({ ...pet, isCovered: true, coveredStatus: 'ACTIVE' })
        setPendingServicePetId(null)
      }
    }
  }

  async function handleCreatePet() {
    if (!lookupResult) return
    clearCreatePetError()
    const result = await mutateCreatePet(
      () =>
        membershipClinicApi.createPet(lookupResult.id, clinicId, {
          name: newPetForm.name.trim(),
          petType: newPetForm.petType,
          gender: newPetForm.gender,
          approxAge: newPetForm.approxAge || undefined,
          breed: newPetForm.breed || undefined,
          color: newPetForm.color || undefined,
          weightKg: newPetForm.weightKg ? Number(newPetForm.weightKg) : undefined,
          notes: newPetForm.notes || undefined,
        }),
      undefined,
    )
    if (result) {
      setShowCreatePetModal(false)
      setNewPetForm({ name: '', petType: 'dog', gender: 'unknown', approxAge: '', breed: '', color: '', weightKg: '', notes: '' })
      await refreshMembership()
      const latestPet = await membershipClinicApi.getMembershipPets(lookupResult.id, clinicId)
      setPetData(latestPet)
      const createdPet = latestPet.pets.find((pet) => pet.id === result.id)
      if (createdPet) {
        setPendingServicePetId(createdPet.id)
        setShowLinkModal(createdPet)
      }
    }
  }

  async function handleServiceSubmit() {
    if (!lookupResult || !selectedPet) return
    clearServiceError()
    const regularPrice = Number(serviceForm.regularPrice)
    const discountAmount = Number(serviceForm.discountAmount)
    const payableAmount = Number(serviceForm.payableAmount)
    const result = await mutateServiceUsage(
      () =>
        membershipClinicApi.createServiceUsage(lookupResult.id, {
          clinicId,
          petId: selectedPet.id,
          benefitId: serviceForm.benefitId,
          serviceCode: serviceForm.serviceCode.trim(),
          serviceName: serviceForm.serviceName.trim(),
          regularPrice,
          discountAmount,
          payableAmount,
          doctorId: serviceForm.doctorId || undefined,
          notes: serviceForm.notes || undefined,
        }),
      undefined,
    )
    if (result) {
      setShowServiceModal(null)
      setServiceForm({
        benefitId: '',
        serviceCode: '',
        serviceName: '',
        staffId: '',
        doctorId: '',
        regularPrice: '',
        discountAmount: '',
        payableAmount: '',
        notes: '',
      })
      await refreshMembership()
    }
  }

  async function handleReplacementRequest() {
    if (!lookupResult || !showReplacementModal) return
    clearReplacementError()
    const result = await mutateReplacement(
      () =>
        membershipClinicApi.createReplacementRequest(lookupResult.id, {
          clinicId,
          oldCoveredPetId: showReplacementModal.id,
          reason: replacementReason,
          notes: replacementNotes || undefined,
        }),
      undefined,
    )
    if (result) {
      setShowReplacementModal(null)
      setReplacementReason('DECEASED')
      setReplacementNotes('')
      await refreshMembership()
    }
  }

  function openService(pet: ClinicMembershipPet) {
    setServiceForm((current) => ({
      ...current,
      staffId: current.staffId || session?.user?.id || '',
    }))
    if (pet.isCovered) {
      setShowServiceModal(pet)
      return
    }
    setPendingServicePetId(pet.id)
    setShowLinkModal(pet)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Clinic Membership Service"
        breadcrumbs={[{ label: 'Membership Management', href: '/community-care/membership' }, { label: 'Clinic Membership Service' }]}
      />

      {!online && (
        <Alert variant="warning">
          <strong>Offline.</strong> Reconnect to look up members, link pets, and submit service usage.
        </Alert>
      )}

      {lookupMutationError && <ApiErrorAlert error={lookupMutationError} onDismiss={clearLookupMutationError} />}
      {lookupMutationError?.status === 401 && (
        <Alert variant="danger">Unauthorized. Sign in with a staff account that has clinic membership permissions.</Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <Form.Label>Clinic</Form.Label>
              <Form.Select value={clinicId} onChange={(e) => setClinicId(e.target.value)}>
                <option value="">Select clinic</option>
                {clinicOptions.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.label}
                  </option>
                ))}
              </Form.Select>
              {clinicId && <div className="text-muted small mt-1">{clinicOptions.find((item) => item.id === clinicId)?.subLabel ?? ''}</div>}
            </Col>
            <Col lg={3}>
              <Form.Label>Lookup type</Form.Label>
              <Form.Select value={lookupMode} onChange={(e) => setLookupMode(e.target.value as LookupMode)}>
                {Object.entries(LOOKUP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={4}>
              <Form.Label>{LOOKUP_LABELS[lookupMode]}</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Icon icon={lookupMode === 'qrToken' ? 'solar:qr-code-bold' : 'solar:magnifer-bold'} />
                </InputGroup.Text>
                <Form.Control
                  placeholder={`Enter ${LOOKUP_LABELS[lookupMode].toLowerCase()}...`}
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLookup()
                  }}
                />
              </InputGroup>
            </Col>
            <Col lg={1} className="d-grid">
              <Button
                onClick={handleLookup}
                disabled={!online || !clinicId || !lookupValue.trim() || loadingLookup || !can('membership_lookup:read')}>
                {loadingLookup ? <Spinner size="sm" /> : 'Find'}
              </Button>
            </Col>
          </Row>
          {!can('membership_lookup:read') && (
            <Alert variant="warning" className="mt-3 mb-0">
              You do not have permission to look up membership cards.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <LoadingOverlay loading={loadingLookup}>
        {!lookupResult && !loadingLookup && (
          <Card>
            <Card.Body className="text-center py-5">
              <Icon icon="solar:card-search-bold-duotone" className="fs-1 text-muted mb-2" />
              <h5 className="mb-1">No member loaded</h5>
              <div className="text-muted">Scan QR or search by membership details to start clinic service.</div>
            </Card.Body>
          </Card>
        )}

        {lookupResult && (
          <>
            <Row className="g-3 mb-3">
              <Col lg={8}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex gap-3 align-items-start">
                      <div
                        className="rounded-circle border d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{
                          width: 72,
                          height: 72,
                          backgroundImage: `url(${ownerAvatar})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                        aria-label={ownerName}>
                        {!ownerAvatar ? ownerName.slice(0, 1).toUpperCase() : ''}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                          <h5 className="mb-0">{ownerName}</h5>
                          <StatusBadge status={lookupResult.status} />
                          {lookupResult.upgradeRequired && <Badge bg="warning">Upgrade Membership</Badge>}
                        </div>
                        <Row className="g-2 small">
                          <Col md={6}>
                            <div className="text-muted">Membership number</div>
                            <div className="fw-semibold">{lookupResult.membershipNumber ?? '—'}</div>
                          </Col>
                          <Col md={6}>
                            <div className="text-muted">Card number</div>
                            <div className="fw-semibold">{lookupResult.cardNumber ?? '—'}</div>
                          </Col>
                          <Col md={6}>
                            <div className="text-muted">Mobile</div>
                            <div>{ownerMobile ?? '—'}</div>
                          </Col>
                          <Col md={6}>
                            <div className="text-muted">Email</div>
                            <div>{ownerEmail ?? '—'}</div>
                          </Col>
                          <Col md={6}>
                            <div className="text-muted">Valid until</div>
                            <div>{formatDate(lookupResult.validUntil)}</div>
                          </Col>
                          <Col md={6}>
                            <div className="text-muted">Service usage</div>
                            <div>{membershipDetail?.serviceUsageHistory.length ?? 0} records</div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="h-100">
                  <Card.Body>
                    <h6 className="mb-3">Member Summary</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Card plan</span>
                      <strong>{lookupResult.membershipNumber ? 'Active membership' : 'Membership card'}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Maximum covered pets</span>
                      <strong>{lookupResult.maxCoveredPets}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Linked pets count</span>
                      <strong>{linkedPetsCount}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Remaining slots</span>
                      <strong>{lookupResult.remainingPetSlots}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Available benefits</span>
                      <strong>{availableBenefitsCount}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Replacement pending</span>
                      <strong>{lookupResult.replacementPendingCount}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {lookupResult.remainingPetSlots <= 0 && (
              <Alert variant="warning" className="mb-3">
                <div className="fw-semibold">Membership limit reached</div>
                <div>Membership linking is disabled until the member upgrades the current card.</div>
                <div className="small mt-1">Current plan: active card · Upgrade target: backend-required higher plan</div>
                <div className="small mt-1">Regular non-membership clinic service may still be provided if your clinic supports it.</div>
              </Alert>
            )}

            <Card className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Owner Pets</h5>
                {can('pets:create') && (
                  <Button size="sm" onClick={() => setShowCreatePetModal(true)}>
                    <Icon icon="solar:add-circle-bold" className="me-1" />
                    Add New Pet
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                <div className="text-muted small mb-3">Show every pet from the owner&apos;s shared BPA/Furtail account.</div>
                <Row className="g-3">
                  {(petData?.pets ?? []).map((pet) => {
                    const coverage = getCoverageMeta(pet)
                    const canLink =
                      can('membership_pet_link:create') && pet.canBeLinkedNow && !lookupResult.upgradeRequired && lookupResult.remainingPetSlots > 0
                    const canProvideService = can('membership_service_provide:create')
                    const needsReplacement = pet.coveredStatus === 'DECEASED' || pet.coveredStatus === 'LOST'
                    const canRequestReplacement = can('membership_replacement_request:create') || can('membership.replacement.request:create')
                    return (
                      <Col lg={6} key={pet.id}>
                        <Card className="h-100 border-light">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1">{pet.name}</h6>
                                <div className="text-muted small text-capitalize">
                                  {pet.petType ?? 'Pet'}
                                  {pet.breed ? ` · ${pet.breed}` : ''}
                                  {pet.gender ? ` · ${pet.gender}` : ''}
                                </div>
                              </div>
                              <Badge bg={coverage.variant}>{coverage.label}</Badge>
                            </div>
                            <Row className="g-2 small mb-3">
                              <Col xs={6}>
                                <div className="text-muted">Slot</div>
                                <div>{pet.slotNumber ?? '—'}</div>
                              </Col>
                              <Col xs={6}>
                                <div className="text-muted">Covered since</div>
                                <div>{formatDate(pet.coveredSince)}</div>
                              </Col>
                            </Row>
                            <div className="d-flex flex-wrap gap-2">
                              {!pet.isCovered && (
                                <Button size="sm" disabled={!canLink} onClick={() => setShowLinkModal(pet)}>
                                  Link to Membership and Provide Service
                                </Button>
                              )}
                              {pet.isCovered && (
                                <Button size="sm" variant="success" disabled={!canProvideService} onClick={() => openService(pet)}>
                                  Provide Service
                                </Button>
                              )}
                              {!pet.isCovered && canProvideService && (
                                <Button size="sm" variant="outline-primary" disabled={!canLink} onClick={() => openService(pet)}>
                                  Continue Service After Link
                                </Button>
                              )}
                              {needsReplacement && canRequestReplacement && (
                                <Button size="sm" variant="outline-warning" onClick={() => setShowReplacementModal(pet)}>
                                  Replacement Request
                                </Button>
                              )}
                            </div>
                            {!canLink && !pet.isCovered && (
                              <div className="small text-muted mt-2">Membership linking is unavailable for this pet right now.</div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              </Card.Body>
            </Card>

            <Row className="g-3">
              <Col lg={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Available Benefits</h5>
                  </Card.Header>
                  <Card.Body>
                    {selectedBenefits.length === 0 ? (
                      <div className="text-muted">No membership benefits loaded.</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {selectedBenefits.map((benefit) => (
                          <div key={benefit.id} className="border rounded p-2">
                            <div className="fw-semibold">{benefit.titleEn}</div>
                            {benefit.descriptionEn && <div className="small text-muted">{benefit.descriptionEn}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Service Usage</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Service</th>
                          <th>Clinic</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(membershipDetail?.serviceUsageHistory ?? []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              No service usage yet.
                            </td>
                          </tr>
                        ) : (
                          membershipDetail?.serviceUsageHistory.map((item) => (
                            <tr key={item.id}>
                              <td>{formatDateTime(item.serviceDate)}</td>
                              <td>
                                <div className="fw-semibold">{item.serviceName}</div>
                                <div className="text-muted small">{item.serviceCode}</div>
                              </td>
                              <td>{clinicOptions.find((clinic) => clinic.id === item.clinicId)?.label ?? item.clinicId}</td>
                              <td>{item.notes ?? '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </LoadingOverlay>

      <Modal
        show={!!showLinkModal}
        onHide={() => {
          setShowLinkModal(null)
          setPendingServicePetId(null)
          clearLinkError()
        }}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Permanent Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">{PERMANENT_LINK_MESSAGE}</p>
          {showLinkModal && (
            <div className="small text-muted">
              Pet: <strong>{showLinkModal.name}</strong>
            </div>
          )}
          <ApiErrorAlert error={linkError as ApiError | null} onDismiss={clearLinkError} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => {
              setShowLinkModal(null)
              setPendingServicePetId(null)
            }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmLink} disabled={linking}>
            {linking ? <Spinner size="sm" /> : 'Confirm Link'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCreatePetModal}
        onHide={() => {
          setShowCreatePetModal(false)
          clearCreatePetError()
        }}>
        <Modal.Header closeButton>
          <Modal.Title>Create Shared Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="small text-muted mb-3">
            Create the pet under the same owner, then return to membership linking before service continues.
          </div>
          <ApiErrorAlert error={createPetError as ApiError | null} onDismiss={clearCreatePetError} />
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Owner</Form.Label>
              <Form.Control value={ownerName} readOnly />
            </Col>
            <Col md={6}>
              <Form.Label>Pet name</Form.Label>
              <Form.Control value={newPetForm.name} onChange={(e) => setNewPetForm((current) => ({ ...current, name: e.target.value }))} />
            </Col>
            <Col md={6}>
              <Form.Label>Pet type</Form.Label>
              <Form.Select value={newPetForm.petType} onChange={(e) => setNewPetForm((current) => ({ ...current, petType: e.target.value }))}>
                {PET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Gender</Form.Label>
              <Form.Select value={newPetForm.gender} onChange={(e) => setNewPetForm((current) => ({ ...current, gender: e.target.value }))}>
                {PET_GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Approx age</Form.Label>
              <Form.Control value={newPetForm.approxAge} onChange={(e) => setNewPetForm((current) => ({ ...current, approxAge: e.target.value }))} />
            </Col>
            <Col md={6}>
              <Form.Label>Breed</Form.Label>
              <Form.Control value={newPetForm.breed} onChange={(e) => setNewPetForm((current) => ({ ...current, breed: e.target.value }))} />
            </Col>
            <Col md={6}>
              <Form.Label>Color</Form.Label>
              <Form.Control value={newPetForm.color} onChange={(e) => setNewPetForm((current) => ({ ...current, color: e.target.value }))} />
            </Col>
            <Col md={6}>
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control value={newPetForm.weightKg} onChange={(e) => setNewPetForm((current) => ({ ...current, weightKg: e.target.value }))} />
            </Col>
            <Col md={12}>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newPetForm.notes}
                onChange={(e) => setNewPetForm((current) => ({ ...current, notes: e.target.value }))}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowCreatePetModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreatePet} disabled={creatingPet || !newPetForm.name.trim()}>
            {creatingPet ? <Spinner size="sm" /> : 'Create Pet'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!showServiceModal}
        onHide={() => {
          setShowServiceModal(null)
          clearServiceError()
        }}
        size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Provide Membership Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={serviceError as ApiError | null} onDismiss={clearServiceError} />
          {selectedPet && (
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Selected pet</Form.Label>
                <Form.Control readOnly value={selectedPet.name} />
              </Col>
              <Col md={6}>
                <Form.Label>Selected membership benefit</Form.Label>
                <Form.Select value={serviceForm.benefitId} onChange={(e) => setServiceForm((current) => ({ ...current, benefitId: e.target.value }))}>
                  <option value="">Select benefit</option>
                  {selectedBenefits.map((benefit) => (
                    <option key={benefit.id} value={benefit.id}>
                      {benefit.titleEn}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Clinic service</Form.Label>
                <Form.Control
                  value={serviceForm.serviceName}
                  onChange={(e) => setServiceForm((current) => ({ ...current, serviceName: e.target.value }))}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Service code</Form.Label>
                <Form.Control
                  value={serviceForm.serviceCode}
                  onChange={(e) => setServiceForm((current) => ({ ...current, serviceCode: e.target.value }))}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Staff</Form.Label>
                <Form.Select value={serviceForm.staffId} onChange={(e) => setServiceForm((current) => ({ ...current, staffId: e.target.value }))}>
                  <option value="">Select staff</option>
                  {staffOptions.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Doctor if required</Form.Label>
                <Form.Select value={serviceForm.doctorId} onChange={(e) => setServiceForm((current) => ({ ...current, doctorId: e.target.value }))}>
                  <option value="">Select doctor</option>
                  {doctorOptions.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Regular price</Form.Label>
                <Form.Control
                  type="number"
                  value={serviceForm.regularPrice}
                  onChange={(e) => setServiceForm((current) => ({ ...current, regularPrice: e.target.value }))}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Membership discount</Form.Label>
                <Form.Control
                  type="number"
                  value={serviceForm.discountAmount}
                  onChange={(e) => setServiceForm((current) => ({ ...current, discountAmount: e.target.value }))}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Payable amount</Form.Label>
                <Form.Control
                  type="number"
                  value={serviceForm.payableAmount}
                  onChange={(e) => setServiceForm((current) => ({ ...current, payableAmount: e.target.value }))}
                />
              </Col>
              <Col md={12}>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={serviceForm.notes}
                  onChange={(e) => setServiceForm((current) => ({ ...current, notes: e.target.value }))}
                />
              </Col>
            </Row>
          )}
          <Alert variant="info" className="mt-3 mb-0">
            The backend response is authoritative for price and eligibility. Submit only the clinic-confirmed values.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <div className="me-auto small text-muted">
            Regular: {asCurrency(Number(serviceForm.regularPrice || 0))} · Discount: {asCurrency(Number(serviceForm.discountAmount || 0))} · Payable:{' '}
            {asCurrency(Number(serviceForm.payableAmount || 0))}
          </div>
          <Button variant="light" onClick={() => setShowServiceModal(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleServiceSubmit}
            disabled={
              savingService ||
              !serviceForm.benefitId ||
              !serviceForm.serviceCode.trim() ||
              !serviceForm.serviceName.trim() ||
              !serviceForm.staffId ||
              serviceForm.regularPrice === '' ||
              serviceForm.discountAmount === '' ||
              serviceForm.payableAmount === ''
            }>
            {savingService ? <Spinner size="sm" /> : 'Confirm Service'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!showReplacementModal}
        onHide={() => {
          setShowReplacementModal(null)
          clearReplacementError()
        }}>
        <Modal.Header closeButton>
          <Modal.Title>Replacement Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={replacementError as ApiError | null} onDismiss={clearReplacementError} />
          <div className="small text-muted mb-3">This creates a request only. It does not immediately free a membership slot.</div>
          <Form.Label>Reason</Form.Label>
          <Form.Select value={replacementReason} onChange={(e) => setReplacementReason(e.target.value as ReplacementReason)}>
            <option value="DECEASED">Deceased</option>
            <option value="PERMANENTLY_LOST">Permanently lost</option>
          </Form.Select>
          <Form.Label className="mt-3">Notes</Form.Label>
          <Form.Control as="textarea" rows={3} value={replacementNotes} onChange={(e) => setReplacementNotes(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowReplacementModal(null)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleReplacementRequest} disabled={savingReplacement}>
            {savingReplacement ? <Spinner size="sm" /> : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
