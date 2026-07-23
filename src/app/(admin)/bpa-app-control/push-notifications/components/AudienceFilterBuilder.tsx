'use client'

import { useEffect, useState } from 'react'
import { Form, Row, Col, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { locationTreeApi } from '@/lib/api/locations.api'
import { communityMembershipApi } from '@/lib/api/community-membership.api'
import type { AudienceFilter } from '@/lib/api/push-notifications.api'
import type { LocationNode } from '@/types/bpa.types'

const PET_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'other']

interface Props {
  value: AudienceFilter
  onChange: (next: AudienceFilter) => void
  disabled?: boolean
}

// Reusable audience-segment filter UI shared by Compose and Audience Segments.
export default function AudienceFilterBuilder({ value, onChange, disabled }: Props) {
  const [locationQuery, setLocationQuery] = useState('')
  const [locationResults, setLocationResults] = useState<LocationNode[]>([])
  const [locationLabels, setLocationLabels] = useState<Record<string, string>>({})
  const [tiers, setTiers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    communityMembershipApi
      .listTiers()
      .then((res: unknown) => {
        const list = Array.isArray(res) ? res : ((res as { data?: unknown[]; items?: unknown[] })?.data ?? (res as { items?: unknown[] })?.items ?? [])
        setTiers(list as Array<{ id: string; name: string }>)
      })
      .catch(() => setTiers([]))
  }, [])

  useEffect(() => {
    if (locationQuery.trim().length < 2) {
      setLocationResults([])
      return
    }
    const t = setTimeout(() => {
      locationTreeApi
        .search(locationQuery.trim())
        .then((res) => setLocationResults(res))
        .catch(() => setLocationResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [locationQuery])

  const set = <K extends keyof AudienceFilter>(key: K, val: AudienceFilter[K]) => onChange({ ...value, [key]: val })

  const addLocation = (node: LocationNode) => {
    const ids = value.locationIds ?? []
    if (ids.includes(node.id)) return
    setLocationLabels((prev) => ({ ...prev, [node.id]: node.nameEn }))
    set('locationIds', [...ids, node.id])
    setLocationQuery('')
    setLocationResults([])
  }

  const removeLocation = (id: string) => {
    set('locationIds', (value.locationIds ?? []).filter((x) => x !== id))
  }

  const togglePetType = (pt: string) => {
    const cur = value.petTypes ?? []
    set('petTypes', cur.includes(pt) ? cur.filter((x) => x !== pt) : [...cur, pt])
  }

  const toggleTier = (id: string) => {
    const cur = value.membershipTierIds ?? []
    set('membershipTierIds', cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
  }

  return (
    <div className="d-flex flex-column gap-3">
      <Row className="g-3">
        <Col md={6}>
          <Form.Label className="small fw-semibold">Locations</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search division / district / upazila..."
            value={locationQuery}
            disabled={disabled}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
          {locationResults.length > 0 && (
            <div className="list-group position-relative mt-1" style={{ zIndex: 5 }}>
              {locationResults.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="list-group-item list-group-item-action small"
                  onClick={() => addLocation(n)}>
                  {n.nameEn} <span className="text-muted">({n.type})</span>
                </button>
              ))}
            </div>
          )}
          <div className="d-flex flex-wrap gap-1 mt-2">
            {(value.locationIds ?? []).map((id) => (
              <Badge key={id} bg="light" text="dark" className="border d-flex align-items-center gap-1">
                {locationLabels[id] ?? id}
                {!disabled && (
                  <Icon icon="solar:close-circle-bold" width="14" style={{ cursor: 'pointer' }} onClick={() => removeLocation(id)} />
                )}
              </Badge>
            ))}
          </div>
        </Col>

        <Col md={6}>
          <Form.Label className="small fw-semibold">Pet Types</Form.Label>
          <div className="d-flex flex-wrap gap-3">
            {PET_TYPES.map((pt) => (
              <Form.Check
                key={pt}
                type="checkbox"
                id={`pet-type-${pt}`}
                label={pt}
                className="text-capitalize"
                disabled={disabled}
                checked={(value.petTypes ?? []).includes(pt)}
                onChange={() => togglePetType(pt)}
              />
            ))}
          </div>
        </Col>

        <Col md={6}>
          <Form.Label className="small fw-semibold">Membership Tiers</Form.Label>
          <div className="d-flex flex-wrap gap-3">
            {tiers.length === 0 && <span className="text-muted small">No tiers found</span>}
            {tiers.map((t) => (
              <Form.Check
                key={t.id}
                type="checkbox"
                id={`tier-${t.id}`}
                label={t.name}
                disabled={disabled}
                checked={(value.membershipTierIds ?? []).includes(t.id)}
                onChange={() => toggleTier(t.id)}
              />
            ))}
          </div>
        </Col>

        <Col md={6}>
          <Form.Label className="small fw-semibold">Campaign Registrants (Campaign ID)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Optional campaign id"
            disabled={disabled}
            value={value.campaignId ?? ''}
            onChange={(e) => set('campaignId', e.target.value || undefined)}
          />
        </Col>

        <Col md={4}>
          <Form.Label className="small fw-semibold">Language</Form.Label>
          <Form.Select
            disabled={disabled}
            value={value.language ?? ''}
            onChange={(e) => set('language', (e.target.value || undefined) as AudienceFilter['language'])}>
            <option value="">Any</option>
            <option value="en">English</option>
            <option value="bn">Bangla</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Label className="small fw-semibold">Platform</Form.Label>
          <Form.Select
            disabled={disabled}
            value={value.platform ?? ''}
            onChange={(e) => set('platform', (e.target.value || undefined) as AudienceFilter['platform'])}>
            <option value="">Any</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
            <option value="web">Web</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Label className="small fw-semibold">Min App Version</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. 2.3.0"
            disabled={disabled}
            value={value.minAppVersion ?? ''}
            onChange={(e) => set('minAppVersion', e.target.value || undefined)}
          />
        </Col>
      </Row>
    </div>
  )
}
