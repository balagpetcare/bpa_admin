'use client'
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { locationsApi } from '@/lib/api/locations.api'
import { petCensusApi } from '@/lib/api/pet-census.api'
import type { ApiError } from '@/lib/api'
import type {
  MediaFile,
  PetCensusNeuteredStatus,
  PetCensusPetGender,
  PetCensusPetType,
  PetCensusPublicSubmitDto,
  PetCensusPublicSubmitResult,
  PetCensusVaccinationStatus,
} from '@/types/bpa.types'

const PET_TYPES: PetCensusPetType[] = ['cat', 'dog', 'bird', 'rabbit', 'other']
const PET_GENDERS: PetCensusPetGender[] = ['male', 'female', 'unknown']
const VACCINATION_STATUSES: PetCensusVaccinationStatus[] = ['up_to_date', 'due', 'not_vaccinated', 'unknown']
const NEUTERED_STATUSES: PetCensusNeuteredStatus[] = ['yes', 'no', 'planned', 'unknown']

function labelize(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function PetCensusRegisterForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: hierarchy, loading: loadingHierarchy, error: hierarchyError } = useApi(() => locationsApi.getPublicHierarchy(), [])
  const { mutate, loading: submitting, error } = useApiMutation<PetCensusPublicSubmitResult, void>()
  const { mutate: uploadPhoto, loading: uploadingPhoto, error: uploadError } = useApiMutation<MediaFile, void>()
  const [form, setForm] = useState({
    ownerName: '',
    mobile: '',
    email: '',
    divisionId: '',
    districtId: '',
    cityUpazila: '',
    address: '',
    isBpaMember: 'no',
    petName: '',
    petType: 'cat' as PetCensusPetType,
    petGender: 'unknown' as PetCensusPetGender,
    approxAge: '',
    breed: '',
    vaccinationStatus: 'unknown' as PetCensusVaccinationStatus,
    neuteredStatus: 'unknown' as PetCensusNeuteredStatus,
    healthIssue: '',
    householdPetCount: '1',
    photoMediaId: '',
    photoUrl: '',
    consent: false,
  })
  const [photoFileName, setPhotoFileName] = useState('')

  const divisions = hierarchy?.flatMap((country) => country.divisions) ?? []
  const selectedDivision = divisions.find((item) => item.id === form.divisionId) ?? null
  const districts = selectedDivision?.districts ?? []
  const selectedDistrict = districts.find((item) => item.id === form.districtId) ?? null
  const suggestedAreas = selectedDistrict?.cityCorporations ?? []

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleDivisionChange(value: string) {
    setForm((current) => ({
      ...current,
      divisionId: value,
      districtId: '',
    }))
  }

  async function handlePhotoChange(file: File | null) {
    if (!file) {
      setPhotoFileName('')
      setForm((current) => ({ ...current, photoMediaId: '', photoUrl: '' }))
      return
    }

    const uploaded = await uploadPhoto(() => petCensusApi.uploadPublicPhoto(file), undefined)
    if (!uploaded) return

    setPhotoFileName(file.name)
    setForm((current) => ({
      ...current,
      photoMediaId: uploaded.id,
      photoUrl: uploaded.url,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const division = divisions.find((item) => item.id === form.divisionId)
    const district = districts.find((item) => item.id === form.districtId)

    if (!division || !district) return

    const payload: PetCensusPublicSubmitDto = {
      ownerName: form.ownerName.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      division: division.name,
      district: district.name,
      cityUpazila: form.cityUpazila.trim(),
      address: form.address.trim(),
      area: form.address.trim(),
      isBpaMember: form.isBpaMember === 'yes',
      petName: form.petName.trim(),
      petType: form.petType,
      petGender: form.petGender,
      approxAge: form.approxAge.trim(),
      breed: form.breed.trim() || undefined,
      vaccinationStatus: form.vaccinationStatus,
      neuteredStatus: form.neuteredStatus,
      healthIssue: form.healthIssue.trim() || undefined,
      householdPetCount: Number(form.householdPetCount),
      photoMediaId: form.photoMediaId || undefined,
      photoUrl: form.photoUrl || undefined,
      consent: form.consent,
      petCount: 1,
      source: 'PET_CENSUS_2026',
      sourceRoute: '/pet-census/register',
    }

    const submission = await mutate(() => petCensusApi.submitPublic(payload), undefined)
    if (!submission) return

    const params = new URLSearchParams({
      id: submission.id,
      duplicate: submission.duplicateHint.possibleDuplicate ? '1' : '0',
    })
    router.push(`/pet-census/thank-you?${params.toString()}`)
  }

  return (
    <main className="pet-census-public">
      <section className="pet-census-form-shell">
        <div className="container-fluid">
          <div className="pet-census-form-shell__intro">
            <span className="pet-census-kicker">Pet Census 2026 Registration</span>
            <h1>বাংলাদেশজুড়ে পোষা প্রাণীর তথ্য একসাথে</h1>
            <p>
              One submission captures one pet profile. If you have multiple pets, you can submit this form again after completion.
            </p>
            {session?.user && (
              <Alert variant="success" className="mb-0">
                Signed in as <strong>{session.user.name}</strong>. Your submission will be linked to your BPA account automatically.
              </Alert>
            )}
          </div>

          <Card className="pet-census-form-card">
            <Card.Body className="p-4 p-lg-5">
              <ApiErrorAlert error={(hierarchyError ?? uploadError ?? error) as ApiError | null} />
              {loadingHierarchy ? (
                <div className="py-5 text-center text-muted">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading Bangladesh location data...
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <div className="pet-census-form-card__section">
                    <div>
                      <span className="pet-census-kicker">Owner Section</span>
                      <h2>Owner information</h2>
                    </div>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Full name</Form.Label>
                          <Form.Control required value={form.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Mobile number</Form.Label>
                          <Form.Control required value={form.mobile} onChange={(e) => updateField('mobile', e.target.value)} placeholder="01XXXXXXXXX" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email (optional)</Form.Label>
                          <Form.Control type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Is BPA member?</Form.Label>
                          <Form.Select value={form.isBpaMember} onChange={(e) => updateField('isBpaMember', e.target.value)}>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Division</Form.Label>
                          <Form.Select required value={form.divisionId} onChange={(e) => handleDivisionChange(e.target.value)}>
                            <option value="">Select division</option>
                            {divisions.map((division) => (
                              <option key={division.id} value={division.id}>{division.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>District</Form.Label>
                          <Form.Select required value={form.districtId} onChange={(e) => updateField('districtId', e.target.value)} disabled={!selectedDivision}>
                            <option value="">Select district</option>
                            {districts.map((district) => (
                              <option key={district.id} value={district.id}>{district.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>City / Upazila</Form.Label>
                          <Form.Control required value={form.cityUpazila} onChange={(e) => updateField('cityUpazila', e.target.value)} list="pet-census-city-suggestions" />
                          <datalist id="pet-census-city-suggestions">
                            {suggestedAreas.map((item) => <option key={item.id} value={item.name} />)}
                          </datalist>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Area / address</Form.Label>
                          <Form.Control required as="textarea" rows={3} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="pet-census-form-card__section">
                    <div>
                      <span className="pet-census-kicker">Pet Section</span>
                      <h2>Pet information</h2>
                    </div>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Pet name</Form.Label>
                          <Form.Control required value={form.petName} onChange={(e) => updateField('petName', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Pet type</Form.Label>
                          <Form.Select value={form.petType} onChange={(e) => updateField('petType', e.target.value as PetCensusPetType)}>
                            {PET_TYPES.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Gender</Form.Label>
                          <Form.Select value={form.petGender} onChange={(e) => updateField('petGender', e.target.value as PetCensusPetGender)}>
                            {PET_GENDERS.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Approx age</Form.Label>
                          <Form.Control required value={form.approxAge} onChange={(e) => updateField('approxAge', e.target.value)} placeholder="e.g. 2 years" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Breed (optional)</Form.Label>
                          <Form.Control value={form.breed} onChange={(e) => updateField('breed', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Vaccination status</Form.Label>
                          <Form.Select value={form.vaccinationStatus} onChange={(e) => updateField('vaccinationStatus', e.target.value as PetCensusVaccinationStatus)}>
                            {VACCINATION_STATUSES.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Neutered / spayed</Form.Label>
                          <Form.Select value={form.neuteredStatus} onChange={(e) => updateField('neuteredStatus', e.target.value as PetCensusNeuteredStatus)}>
                            {NEUTERED_STATUSES.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Number of pets in household</Form.Label>
                          <Form.Control type="number" min={1} max={999} required value={form.householdPetCount} onChange={(e) => updateField('householdPetCount', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Health issue (optional)</Form.Label>
                          <Form.Control value={form.healthIssue} onChange={(e) => updateField('healthIssue', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Pet photo (optional)</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => void handlePhotoChange((e.target as HTMLInputElement).files?.[0] ?? null)}
                          />
                          <Form.Text className="text-muted">
                            Optional. Upload a real image file to the BPA media storage.
                          </Form.Text>
                          {(uploadingPhoto || form.photoUrl) && (
                            <div className="pet-census-upload-preview mt-3">
                              {uploadingPhoto ? (
                                <div className="text-muted small">
                                  <Spinner animation="border" size="sm" className="me-2" />
                                  Uploading pet photo...
                                </div>
                              ) : (
                                <>
                                  <div className="pet-census-upload-preview__image">
                                    <img src={form.photoUrl} alt="Pet photo preview" />
                                  </div>
                                  <div className="small">
                                    <div className="fw-semibold">{photoFileName || 'Uploaded photo'}</div>
                                    <div className="text-muted">Saved to BPA media storage</div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="pet-census-form-card__section">
                    <div className="pet-census-privacy-box">
                      <h3>Privacy notice</h3>
                      <p className="mb-0">
                        This data is used for BPA welfare planning only, including clinic, vaccination, membership, rescue, and campaign preparation.
                      </p>
                    </div>
                    <Form.Check
                      id="pet-census-consent"
                      className="mt-3"
                      label="I agree that BPA may use this information for pet welfare planning and future support programs."
                      checked={form.consent}
                      onChange={(e) => updateField('consent', e.target.checked)}
                      required
                    />
                  </div>

                  <div className="d-flex flex-wrap gap-3 align-items-center mt-4">
                    <Button type="submit" size="lg" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Pet Census'}
                    </Button>
                    <Link href="/pet-census/status" className="btn btn-outline-secondary btn-lg">Check Status Instead</Link>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>
      </section>
    </main>
  )
}
