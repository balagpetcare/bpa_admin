'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Form, Row, Col, Badge, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { petCensusApi } from '@/lib/api/pet-census.api'
import type { ApiError } from '@/lib/api'

export default function PetCensusSettingsContent() {
  const { can } = usePermission()
  const { mutate, loading: saving, error: mutationError } = useApiMutation<unknown, unknown>()
  
  const [form, setForm] = useState({
    title: 'Pet Census 2026',
    description: '',
    status: 'draft',
    registrationStartAt: '',
    registrationEndAt: '',
    countdownTargetAt: '',
    targetSubmissions: 10000,
    isActive: true,
  })

  const { data: campaigns, loading, error, refetch } = useApi(() => petCensusApi.listCampaigns(), [])

  const activeCampaign = (campaigns as any[])?.find(c => c.isActive) || (campaigns as any[])?.[0]

  useEffect(() => {
    if (!activeCampaign) return
    setForm({
      title: activeCampaign.title,
      description: activeCampaign.description || '',
      status: activeCampaign.status,
      registrationStartAt: activeCampaign.registrationStartAt ? new Date(activeCampaign.registrationStartAt).toISOString().split('T')[0] : '',
      registrationEndAt: activeCampaign.registrationEndAt ? new Date(activeCampaign.registrationEndAt).toISOString().split('T')[0] : '',
      countdownTargetAt: activeCampaign.countdownTargetAt ? new Date(activeCampaign.countdownTargetAt).toISOString().split('T')[0] : '',
      targetSubmissions: activeCampaign.targetSubmissions,
      isActive: activeCampaign.isActive,
    })
  }, [activeCampaign])

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    const payload = {
      ...form,
      registrationStartAt: form.registrationStartAt ? new Date(form.registrationStartAt).toISOString() : null,
      registrationEndAt: form.registrationEndAt ? new Date(form.registrationEndAt).toISOString() : null,
      countdownTargetAt: form.countdownTargetAt ? new Date(form.countdownTargetAt).toISOString() : null,
    }

    let result;
    if (activeCampaign) {
      result = await mutate(() => petCensusApi.updateCampaign(activeCampaign.id, payload), undefined)
    } else {
      result = await mutate(() => petCensusApi.createCampaign(payload), undefined)
    }

    if (result) {
      refetch()
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Pet Census Settings"
        breadcrumbs={[{ label: 'Community Care' }, { label: 'Pet Census' }, { label: 'Settings' }]}
      />

      <ApiErrorAlert error={(mutationError as ApiError | null) ?? (error as ApiError | null)} />

      <LoadingOverlay loading={loading}>
        <Row className="g-3">
          <Col xl={8}>
            <Card>
              <Card.Header>
                <span className="fw-semibold">Active Campaign Configuration</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Campaign Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.title}
                        onChange={(e) => setField('title', e.target.value)}
                        disabled={!can('pet_census:update')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setField('description', e.target.value)}
                        disabled={!can('pet_census:update')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={form.status}
                        onChange={(e) => setField('status', e.target.value)}
                        disabled={!can('pet_census:update')}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="registration_open">Registration Open</option>
                        <option value="registration_closed">Registration Closed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Target Submissions</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.targetSubmissions}
                        onChange={(e) => setField('targetSubmissions', parseInt(e.target.value))}
                        disabled={!can('pet_census:update')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Registration Start</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.registrationStartAt}
                        onChange={(e) => setField('registrationStartAt', e.target.value)}
                        disabled={!can('pet_census:update')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Registration End</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.registrationEndAt}
                        onChange={(e) => setField('registrationEndAt', e.target.value)}
                        disabled={!can('pet_census:update')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Countdown Target</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.countdownTargetAt}
                        onChange={(e) => setField('countdownTargetAt', e.target.value)}
                        disabled={!can('pet_census:update')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Check
                      type="switch"
                      label="Is Active"
                      checked={form.isActive}
                      onChange={(e) => setField('isActive', e.target.checked)}
                      disabled={!can('pet_census:update')}
                    />
                  </Col>
                </Row>
              </Card.Body>
              {can('pet_census:update') && (
                <Card.Footer className="text-end">
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    <Icon icon="solar:diskette-bold" className="me-1" />
                    {activeCampaign ? 'Update Campaign' : 'Create Campaign'}
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </Col>

          <Col xl={4}>
            <Card>
              <Card.Header>
                <span className="fw-semibold">Campaign History</span>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(campaigns as any[])?.map((c) => (
                      <tr key={c.id}>
                        <td className="small">{c.title}</td>
                        <td>
                          <Badge bg="secondary-subtle" text="secondary">
                            {c.status}
                          </Badge>
                        </td>
                        <td>
                          {c.isActive ? (
                            <Icon icon="solar:check-circle-bold" className="text-success" />
                          ) : (
                            <Icon icon="solar:close-circle-bold" className="text-danger" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </LoadingOverlay>
    </div>
  )
}
