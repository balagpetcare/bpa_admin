'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useRouter, useSearchParams } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { clinicsApi, type ClinicOrganization, type ClinicBranch } from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ClinicBranchCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetOrganizationId = searchParams.get('organizationId')
  const { mutate: mutateOrg, loading: orgLoading, error: orgError } = useApiMutation<ClinicOrganization, void>()
  const { mutate: mutateBranch, loading: branchLoading, error: branchError } = useApiMutation<ClinicBranch, void>()
  const loading = orgLoading || branchLoading
  const error = branchError ?? orgError

  const orgsFetch = useCallback(() => clinicsApi.organizations.list({ page: 1, limit: 100 }), [])
  const { data: orgsData } = useApi(orgsFetch, [])
  const organizations = orgsData?.data ?? []

  const [organizationId, setOrganizationId] = useState(presetOrganizationId ?? '')
  const [newOrgName, setNewOrgName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [address, setAddress] = useState('')
  const [area, setArea] = useState('')

  useEffect(() => {
    if (presetOrganizationId) setOrganizationId(presetOrganizationId)
  }, [presetOrganizationId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let orgId = organizationId
    if (!orgId && newOrgName.trim()) {
      const org = await mutateOrg(
        () => clinicsApi.organizations.create({ name: newOrgName.trim(), slug: slugify(newOrgName) }),
        undefined,
      )
      if (!org) return
      orgId = org.id
    }
    if (!orgId) return

    const branch = await mutateBranch(
      () =>
        clinicsApi.branches.create({
          organizationId: orgId,
          branchName,
          address: address || undefined,
          area: area || undefined,
        }),
      undefined,
    )
    if (branch) router.push(`/clinics/${branch.id}/edit`)
  }

  return (
    <div className="container-fluid">
      <PageHeader title="New Clinic Branch" breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Clinics & Branches', href: '/clinics' }, { label: 'New' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Organization</Form.Label>
              <Form.Select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                <option value="">— Create a new organization below —</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {!organizationId && (
              <Form.Group className="mb-3">
                <Form.Label className="small text-muted">New Organization Name</Form.Label>
                <Form.Control value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="e.g. MewMew Pet Care" />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Branch Name</Form.Label>
              <Form.Control required value={branchName} onChange={(e) => setBranchName(e.target.value)} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Area</Form.Label>
                  <Form.Control value={area} onChange={(e) => setArea(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Address</Form.Label>
                  <Form.Control value={address} onChange={(e) => setAddress(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" disabled={loading || !branchName || (!organizationId && !newOrgName.trim())}>
              Create Branch
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
