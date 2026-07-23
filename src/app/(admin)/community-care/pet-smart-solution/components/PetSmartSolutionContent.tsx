'use client'

import { useEffect, useState } from 'react'
import { Card, Alert, Button, Form, Row, Col, Badge } from 'react-bootstrap'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { petSmartSolutionApi } from '@/lib/api/pet-smart-solution.api'
import type { ApiError } from '@/lib/api'
import type { PetSmartConnectionTestResult, PetSmartIntegrationSettings, PetSmartIntegrationSettingsUpdatePayload } from '@/types/bpa.types'

const STATUS_VARIANTS: Record<string, 'secondary' | 'warning' | 'success' | 'danger'> = {
  disabled: 'secondary',
  not_configured: 'warning',
  placeholder_only: 'success',
  invalid_url: 'danger',
}

function statusVariant(status: string) {
  return STATUS_VARIANTS[status] ?? 'secondary'
}

export default function PetSmartSolutionContent() {
  const { can } = usePermission()
  const { mutate, loading: saving, error: mutationError } = useApiMutation<unknown, unknown>()
  const [apiKeyTouched, setApiKeyTouched] = useState(false)
  const [form, setForm] = useState<PetSmartIntegrationSettingsUpdatePayload>({
    enabled: false,
    baseUrl: '',
    apiKey: '',
    syncEnabled: {
      contributors: false,
      carePartnerCards: false,
      petCensusLeads: false,
      zones: false,
    },
  })
  const [testResult, setTestResult] = useState<PetSmartConnectionTestResult | null>(null)

  const { data: settings, loading, error, refetch } = useApi(() => petSmartSolutionApi.getSettings(), [])

  useEffect(() => {
    if (!settings) return
    setApiKeyTouched(false)
    setForm({
      enabled: settings.enabled,
      baseUrl: settings.baseUrl ?? '',
      apiKey: settings.apiKeyReference ?? '',
      syncEnabled: { ...settings.syncEnabled },
    })
  }, [settings])

  function setField<K extends keyof PetSmartIntegrationSettingsUpdatePayload>(key: K, value: PetSmartIntegrationSettingsUpdatePayload[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function setSyncFlag(key: keyof NonNullable<PetSmartIntegrationSettingsUpdatePayload['syncEnabled']>, value: boolean) {
    setForm((current) => ({
      ...current,
      syncEnabled: {
        contributors: current.syncEnabled?.contributors ?? false,
        carePartnerCards: current.syncEnabled?.carePartnerCards ?? false,
        petCensusLeads: current.syncEnabled?.petCensusLeads ?? false,
        zones: current.syncEnabled?.zones ?? false,
        [key]: value,
      },
    }))
  }

  async function handleSave() {
    const payload: PetSmartIntegrationSettingsUpdatePayload = {
      enabled: form.enabled ?? false,
      baseUrl: form.baseUrl?.trim() || null,
      syncEnabled: form.syncEnabled ?? {
        contributors: false,
        carePartnerCards: false,
        petCensusLeads: false,
        zones: false,
      },
    }

    if (apiKeyTouched) {
      payload.apiKey = form.apiKey?.trim() || null
    }

    const result = await mutate(() => petSmartSolutionApi.updateSettings(payload), undefined)
    if (result) {
      setTestResult(null)
      setApiKeyTouched(false)
      refetch()
    }
  }

  async function handleTestConnection() {
    const result = await mutate(() => petSmartSolutionApi.testConnection(), undefined)
    if (result) setTestResult(result as PetSmartConnectionTestResult)
  }

  const currentSettings = settings as PetSmartIntegrationSettings | null

  return (
    <div className="container-fluid">
      <PageHeader
        title="Pet Smart Solution"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Pet Smart Solution' }]}
        action={
          <Link href="/community-care/sync-logs" className="btn btn-outline-primary">
            <Icon icon="solar:history-bold" className="me-1" />
            Sync Logs
          </Link>
        }
      />

      <Alert variant="warning" className="mb-3">
        <strong>This is only an integration placeholder.</strong> Operational clinic, pet shop, appointment, medical record, prescription, e-commerce,
        and social feed modules belong to Pet Smart Solution, not BPA.
      </Alert>

      <ApiErrorAlert error={(mutationError as ApiError | null) ?? (error as ApiError | null)} />

      <LoadingOverlay loading={loading}>
        {currentSettings && (
          <Row className="g-3">
            <Col xl={8}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Integration Settings</span>
                  <Badge bg={`${statusVariant(currentSettings.status)}-subtle`} text={statusVariant(currentSettings.status)}>
                    {currentSettings.status.replace(/_/g, ' ')}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Integration Enabled</Form.Label>
                        <Form.Check
                          type="switch"
                          checked={form.enabled ?? false}
                          onChange={(e) => setField('enabled', e.target.checked)}
                          disabled={!can('pet_smart_solution:update')}
                          label="Allow BPA to hold placeholder integration configuration"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <div className="small text-muted pt-2">{currentSettings.status.replace(/_/g, ' ')}</div>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Base URL / Endpoint</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://future.petsmart.example/api"
                          value={form.baseUrl ?? ''}
                          onChange={(e) => setField('baseUrl', e.target.value)}
                          disabled={!can('pet_smart_solution:update')}
                        />
                        <Form.Text className="text-muted">
                          Store the future Pet Smart Solution base URL here. BPA does not call the external platform in this phase.
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>API Key or Env Reference</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="env:PSS_API_KEY"
                          value={form.apiKey ?? ''}
                          onChange={(e) => {
                            setApiKeyTouched(true)
                            setField('apiKey', e.target.value)
                          }}
                          disabled={!can('pet_smart_solution:update')}
                        />
                        <Form.Text className="text-muted">
                          Prefer an env reference such as `env:PSS_API_KEY`. Current stored value is masked in API responses.
                        </Form.Text>
                        <div className="small text-muted mt-2">
                          Configured: {currentSettings.apiKeyConfigured ? 'Yes' : 'No'}
                          {currentSettings.apiKeyMasked ? ` | Masked: ${currentSettings.apiKeyMasked}` : ''}
                          {currentSettings.apiKeyReference ? ` | Reference: ${currentSettings.apiKeyReference}` : ''}
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <div className="fw-semibold mb-2">Sync Scope</div>
                      <Row className="g-2">
                        <Col md={6}>
                          <Form.Check
                            type="switch"
                            label="Contributors"
                            checked={form.syncEnabled?.contributors ?? false}
                            onChange={(e) => setSyncFlag('contributors', e.target.checked)}
                            disabled={!can('pet_smart_solution:update')}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Check
                            type="switch"
                            label="Care Partner Cards"
                            checked={form.syncEnabled?.carePartnerCards ?? false}
                            onChange={(e) => setSyncFlag('carePartnerCards', e.target.checked)}
                            disabled={!can('pet_smart_solution:update')}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Check
                            type="switch"
                            label="Pet Census Leads"
                            checked={form.syncEnabled?.petCensusLeads ?? false}
                            onChange={(e) => setSyncFlag('petCensusLeads', e.target.checked)}
                            disabled={!can('pet_smart_solution:update')}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Check
                            type="switch"
                            label="Zones"
                            checked={form.syncEnabled?.zones ?? false}
                            onChange={(e) => setSyncFlag('zones', e.target.checked)}
                            disabled={!can('pet_smart_solution:update')}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
                {can('pet_smart_solution:update') && (
                  <Card.Footer className="d-flex justify-content-between align-items-center">
                    <Button variant="outline-secondary" onClick={handleTestConnection} disabled={saving}>
                      <Icon icon="solar:shield-check-bold" className="me-1" />
                      Test Connection
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                      <Icon icon="solar:diskette-bold" className="me-1" />
                      Save Settings
                    </Button>
                  </Card.Footer>
                )}
              </Card>
            </Col>

            <Col xl={4}>
              <Card className="mb-3">
                <Card.Header className="fw-semibold">Integration Snapshot</Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <dt className="col-sm-5">Last Sync</dt>
                    <dd className="col-sm-7">{currentSettings.lastSyncAt ? new Date(currentSettings.lastSyncAt).toLocaleString() : 'Never'}</dd>
                    <dt className="col-sm-5">Enabled</dt>
                    <dd className="col-sm-7">{currentSettings.enabled ? 'Yes' : 'No'}</dd>
                    <dt className="col-sm-5">Base URL</dt>
                    <dd className="col-sm-7 small">{currentSettings.baseUrl ?? 'Not configured'}</dd>
                    <dt className="col-sm-5">API Key</dt>
                    <dd className="col-sm-7 small">
                      {currentSettings.apiKeyConfigured ? (currentSettings.apiKeyMasked ?? 'Configured') : 'Not configured'}
                    </dd>
                  </dl>
                </Card.Body>
              </Card>

              {testResult && (
                <Alert variant={testResult.status === 'placeholder_only' ? 'info' : testResult.status === 'invalid_url' ? 'danger' : 'secondary'}>
                  <div className="fw-semibold mb-1">Connection Test</div>
                  <div className="small">{testResult.message}</div>
                  <div className="small text-muted mt-1">Checked: {new Date(testResult.checkedAt).toLocaleString()}</div>
                </Alert>
              )}
            </Col>
          </Row>
        )}
      </LoadingOverlay>
    </div>
  )
}
