'use client'

import { useState } from 'react'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useApiMutation } from '@/hooks/useApi'
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning'
import { clinicsApi, type ClinicOrganization, type ClinicVerificationStatus, type ClinicClaimStatus } from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const VERIFICATION_OPTIONS: ClinicVerificationStatus[] = ['UNKNOWN', 'UNVERIFIED', 'VERIFIED', 'REJECTED']
const CLAIM_OPTIONS: ClinicClaimStatus[] = ['UNCLAIMED', 'PENDING', 'CLAIMED']

export default function ClinicOrganizationCreateContent() {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<ClinicOrganization, void>()
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [logoMediaId, setLogoMediaId] = useState<string | null>(null)
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null)
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<ClinicVerificationStatus>('UNKNOWN')
  const [claimedStatus, setClaimedStatus] = useState<ClinicClaimStatus>('UNCLAIMED')
  const [featured, setFeatured] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isDirty = name.trim().length > 0 || slug.trim().length > 0 || description.trim().length > 0
  useUnsavedChangesWarning(isDirty && !submitting)

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (!slug.trim()) errors.slug = 'Slug is required'
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) errors.slug = 'Slug must be lowercase, alphanumeric, hyphen-separated'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent, publishNow: boolean) {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const org = await mutate(
        () =>
          clinicsApi.organizations.create({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            logoMediaId,
            coverMediaId,
            website: website.trim() || null,
            email: email.trim() || null,
            verificationStatus,
            claimedStatus,
            featured,
            published: publishNow,
          }),
        undefined,
      )
      if (org) router.push(`/clinics/organizations/${org.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBack() {
    if (isDirty) {
      const ok = await confirmDialog({
        title: 'Discard unsaved changes?',
        text: 'You have unsaved changes to this organization.',
        variant: 'warning',
        confirmText: 'Discard',
      })
      if (!ok) return
    }
    router.push('/clinics/organizations')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="New Clinic Organization"
        breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Organizations', href: '/clinics/organizations' }, { label: 'New' }]}
        action={
          <Button variant="outline-secondary" onClick={handleBack}>
            Back to list
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form>
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    isInvalid={!!fieldErrors.name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!slugTouched) setSlug(slugify(e.target.value))
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.name}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    value={slug}
                    isInvalid={!!fieldErrors.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      setSlug(e.target.value)
                    }}
                  />
                  <Form.Text className="text-muted">Used in the public URL. Lowercase, hyphen-separated, must be unique.</Form.Text>
                  <Form.Control.Feedback type="invalid">{fieldErrors.slug}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <MediaPickerInput
                        label="Clinic Logo"
                        value={logoMediaId}
                        onChange={(fileId) => setLogoMediaId(fileId)}
                        emptyLabel="Select logo"
                        helpText="Selected from the Central Media Library."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <MediaPickerInput
                        label="Cover Image"
                        value={coverMediaId}
                        onChange={(fileId) => setCoverMediaId(fileId)}
                        emptyLabel="Select cover image"
                        helpText="Selected from the Central Media Library."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Website</Form.Label>
                      <Form.Control value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Email</Form.Label>
                      <Form.Control type="email" value={email} isInvalid={!!fieldErrors.email} onChange={(e) => setEmail(e.target.value)} />
                      <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Verification Status</Form.Label>
                  <Form.Select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value as ClinicVerificationStatus)}>
                    {VERIFICATION_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Claimed Status</Form.Label>
                  <Form.Select value={claimedStatus} onChange={(e) => setClaimedStatus(e.target.value as ClinicClaimStatus)}>
                    {CLAIM_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Check className="mb-3" type="switch" label="Featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button variant="outline-primary" disabled={submitting || loading} onClick={(e) => handleSubmit(e, false)}>
                Save Draft
              </Button>
              <Button variant="primary" disabled={submitting || loading} onClick={(e) => handleSubmit(e, true)}>
                Save & Publish
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
