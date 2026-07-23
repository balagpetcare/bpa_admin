'use client'

import { useEffect, useState } from 'react'
import { Card, Form, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import { useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { pushNotificationsApi, type AudienceFilter } from '@/lib/api/push-notifications.api'
import { ApiError } from '@/lib/api'
import AudienceFilterBuilder from '../components/AudienceFilterBuilder'

const STORAGE_KEY = 'bpa-admin.push-notifications.audience-presets'

interface Preset {
  id: string
  name: string
  filter: AudienceFilter
}

function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Preset[]) : []
  } catch {
    return []
  }
}

function savePresets(presets: Preset[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

// Audience segments are built from the same filter fields used in Compose.
// The push-notifications admin API has no dedicated "saved segment" resource
// yet, so named presets are persisted locally (per-browser) purely as a
// convenience for re-using a filter combination in Compose — the live
// recipient estimate below always comes from a real campaign draft created
// against the actual backend, never a fabricated number.
export default function AudienceSegmentsPage() {
  const { can } = usePermission()
  const canCreate = can('notifications:create')

  const [filter, setFilter] = useState<AudienceFilter>({})
  const [presets, setPresets] = useState<Preset[]>([])
  const [presetName, setPresetName] = useState('')

  const [estimate, setEstimate] = useState<number | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const deleteDraftMutation = useApiMutation<void, string>()

  useEffect(() => {
    setPresets(loadPresets())
  }, [])

  const runEstimate = async () => {
    if (!canCreate) {
      setEstimateError('You do not have permission to create campaigns, which is required to estimate a live segment.')
      return
    }
    setEstimating(true)
    setEstimateError(null)
    setEstimate(null)
    let draftId: string | null = null
    try {
      const draft = await pushNotificationsApi.createCampaign({
        title: '[Segment preview - safe to delete]',
        body: 'Internal preview draft used only to compute estimated reach.',
        category: 'promotional',
        priority: 'low',
        channel: 'push',
        audienceType: 'segment',
        audienceFilter: filter,
      })
      draftId = draft.id
      const res = await pushNotificationsApi.estimateAudience(draft.id)
      setEstimate(res.estimatedReach)
    } catch (err) {
      setEstimateError(err instanceof ApiError ? err.message : 'Failed to estimate audience')
    } finally {
      if (draftId) {
        await deleteDraftMutation.mutate((id) => pushNotificationsApi.deleteCampaign(id), draftId)
      }
      setEstimating(false)
    }
  }

  const savePreset = () => {
    if (!presetName.trim()) return
    const next: Preset[] = [...presets, { id: crypto.randomUUID(), name: presetName.trim(), filter }]
    setPresets(next)
    savePresets(next)
    setPresetName('')
  }

  const applyPreset = (p: Preset) => setFilter(p.filter)

  const deletePreset = (id: string) => {
    const next = presets.filter((p) => p.id !== id)
    setPresets(next)
    savePresets(next)
  }

  return (
    <div>
      <PageHeader title="Audience Segments" />
      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent">
              <strong>Build a Segment</strong>
            </Card.Header>
            <Card.Body>
              <AudienceFilterBuilder value={filter} onChange={setFilter} />
              <div className="d-flex align-items-center gap-2 mt-3">
                <Button variant="outline-primary" size="sm" disabled={estimating} onClick={runEstimate}>
                  {estimating ? <Spinner size="sm" className="me-1" /> : <Icon icon="solar:users-group-rounded-bold-duotone" className="me-1" />}
                  Estimate Reach
                </Button>
                {estimate !== null && (
                  <Badge bg="primary-subtle" text="primary">
                    Estimated reach: {estimate.toLocaleString()}
                  </Badge>
                )}
              </div>
              {estimateError && (
                <Alert variant="danger" className="mt-2 mb-0 py-2 small">
                  {estimateError}
                </Alert>
              )}
              <div className="text-muted small mt-2">
                Estimate is computed via a temporary draft campaign against the live audience filter, then discarded.
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent">
              <strong>Saved Presets</strong>
              <div className="text-muted small">Stored in this browser for reuse in Compose.</div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="d-flex gap-2 mb-3">
                <Form.Control size="sm" placeholder="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
                <Button size="sm" onClick={savePreset} disabled={!presetName.trim()}>
                  Save
                </Button>
              </Form.Group>
              {presets.length === 0 ? (
                <div className="text-muted small">No saved presets yet.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {presets.map((p) => (
                    <div key={p.id} className="d-flex justify-content-between align-items-center border rounded-3 px-2 py-1">
                      <span className="small">{p.name}</span>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-secondary" onClick={() => applyPreset(p)}>
                          Apply
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => deletePreset(p.id)}>
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
