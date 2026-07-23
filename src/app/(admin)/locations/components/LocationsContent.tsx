'use client'

import { useCallback, useMemo, useState } from 'react'
import { Card, Button, Badge, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { locationTreeApi } from '@/lib/api/locations.api'
import type { ApiError } from '@/lib/api'
import type { LocationNode, LocationNodeType } from '@/types/bpa.types'

// Types specific enough to host a venue. Division/District are too coarse —
// venues always live under a more specific area. Used only to decide when
// to show the "Manage venues here" link into the separate Venues page.
const VENUE_ELIGIBLE_TYPES: LocationNodeType[] = ['UPAZILA', 'THANA', 'UNION', 'POURASHAVA', 'CITY_CORPORATION', 'CITY_ZONE', 'WARD', 'AREA']

const TYPE_LABEL: Record<LocationNodeType, string> = {
  DIVISION: 'Division',
  DISTRICT: 'District',
  UPAZILA: 'Upazila',
  THANA: 'Thana',
  UNION: 'Union',
  POURASHAVA: 'Pourashava',
  CITY_CORPORATION: 'City Corporation',
  CITY_ZONE: 'City Zone',
  WARD: 'Ward',
  AREA: 'Area',
}

const TYPE_ICON: Record<LocationNodeType, string> = {
  DIVISION: 'solar:map-bold-duotone',
  DISTRICT: 'solar:map-point-bold-duotone',
  UPAZILA: 'solar:signpost-bold-duotone',
  THANA: 'solar:signpost-bold-duotone',
  UNION: 'solar:flag-bold-duotone',
  POURASHAVA: 'solar:flag-bold-duotone',
  CITY_CORPORATION: 'solar:buildings-2-bold-duotone',
  CITY_ZONE: 'solar:layers-minimalistic-bold-duotone',
  WARD: 'solar:point-on-map-bold-duotone',
  AREA: 'solar:point-on-map-bold-duotone',
}

// Location Management browses the Bangladesh administrative hierarchy only.
// Creating/editing physical venues is a separate concern — see the Venues
// page (/venues), which is the single reusable source of venue records for
// campaign sessions.
export default function LocationsContent() {
  // Breadcrumb path from Bangladesh (root) down to the currently selected node.
  const [path, setPath] = useState<LocationNode[]>([])
  const currentNode = path.length > 0 ? path[path.length - 1] : null

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationNode[] | null>(null)
  const [searching, setSearching] = useState(false)

  const childrenFn = useCallback(() => locationTreeApi.listChildren({ parentId: currentNode?.id ?? null }), [currentNode?.id])
  const { data: children, loading: loadingChildren, error: childrenError } = useApi(childrenFn, [currentNode?.id])

  const isVenueEligible = currentNode ? VENUE_ELIGIBLE_TYPES.includes(currentNode.type) : false

  function goToRoot() {
    setPath([])
    setSearchResults(null)
    setSearchQuery('')
  }

  function goToDepth(depth: number) {
    setPath((p) => p.slice(0, depth + 1))
    setSearchResults(null)
  }

  function drillInto(node: LocationNode) {
    setPath((p) => [...p, node])
    setSearchResults(null)
    setSearchQuery('')
  }

  async function runSearch() {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    try {
      const results = await locationTreeApi.search(q)
      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }

  async function jumpToSearchResult(node: LocationNode) {
    const fullPath = await locationTreeApi.getPath(node.id)
    setPath(fullPath)
    setSearchResults(null)
    setSearchQuery('')
  }

  const breadcrumbTrail = useMemo(() => path.map((n) => ({ id: n.id, label: n.nameEn, type: n.type })), [path])

  return (
    <div className="container-fluid">
      <PageHeader title="Location Management" breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Locations' }]} />

      <ApiErrorAlert error={(childrenError as ApiError | null) ?? null} />

      {/* Search across the full Bangladesh location tree */}
      <Card className="mb-3">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <Icon icon="solar:magnifer-bold" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search division, district, upazila, union, city corporation, zone, or ward…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch()
              }}
            />
            <Button variant="outline-secondary" onClick={runSearch} disabled={searching}>
              {searching ? <Spinner size="sm" /> : 'Search'}
            </Button>
            {searchResults !== null && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchResults(null)
                  setSearchQuery('')
                }}>
                <Icon icon="solar:close-circle-bold" />
              </Button>
            )}
          </InputGroup>

          {searchResults !== null && (
            <div className="mt-3">
              {searchResults.length === 0 ? (
                <p className="text-muted small mb-0">No locations matched &quot;{searchQuery}&quot;.</p>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="btn btn-sm btn-outline-light text-start d-flex align-items-center gap-2 border"
                      onClick={() => jumpToSearchResult(r)}>
                      <Icon icon={TYPE_ICON[r.type]} />
                      <span className="fw-medium">{r.nameEn}</span>
                      <Badge bg="secondary" className="ms-auto">
                        {TYPE_LABEL[r.type]}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Breadcrumb: Bangladesh > Division > District > Upazila/City Corp > Union/Zone > Ward */}
      <nav aria-label="location breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0 flex-wrap">
          <li className="breadcrumb-item">
            <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={goToRoot}>
              <Icon icon="solar:global-bold-duotone" className="me-1" />
              Bangladesh
            </button>
          </li>
          {breadcrumbTrail.map((crumb, i) => (
            <li key={crumb.id} className={`breadcrumb-item ${i === breadcrumbTrail.length - 1 ? 'active' : ''}`}>
              {i === breadcrumbTrail.length - 1 ? (
                crumb.label
              ) : (
                <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => goToDepth(i)}>
                  {crumb.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Children of the current node */}
      <Card className={isVenueEligible && currentNode ? 'mb-3' : ''}>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">{currentNode ? `${TYPE_LABEL[currentNode.type]}: ${currentNode.nameEn}` : 'Divisions'}</span>
          {currentNode && (
            <Badge bg="light" text="dark" className="border">
              {TYPE_LABEL[currentNode.type]}
            </Badge>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loadingChildren}>
            {(children ?? []).length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Icon icon="solar:map-point-remove-bold-duotone" style={{ fontSize: 40, opacity: 0.3 }} />
                <div className="mt-2">
                  {isVenueEligible ? 'This is a leaf area — manage its venues on the Venues page.' : 'No child locations are seeded under this node.'}
                </div>
              </div>
            ) : (
              <Row className="g-0">
                {(children ?? []).map((child) => (
                  <Col xs={12} sm={6} md={4} lg={3} key={child.id} className="border-bottom border-end p-2">
                    <button
                      type="button"
                      className="btn btn-light w-100 h-100 text-start d-flex align-items-center gap-2 py-2"
                      onClick={() => drillInto(child)}>
                      <Icon icon={TYPE_ICON[child.type]} className="text-primary flex-shrink-0" style={{ fontSize: 20 }} />
                      <span className="flex-grow-1 text-truncate">{child.nameEn}</span>
                      <Icon icon="solar:alt-arrow-right-linear" className="text-muted" />
                    </button>
                  </Col>
                ))}
              </Row>
            )}
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* Jump-off point to the dedicated Venues page, scoped to this node */}
      {isVenueEligible && currentNode && (
        <Card>
          <Card.Body className="d-flex align-items-center justify-content-between">
            <span className="fw-semibold">
              <Icon icon="solar:buildings-2-bold-duotone" className="me-2 text-primary" />
              Venues in {currentNode.nameEn}
            </span>
            <Link href={`/venues?locationId=${currentNode.id}`} className="btn btn-primary btn-sm">
              Manage venues here <Icon icon="solar:alt-arrow-right-linear" className="ms-1" />
            </Link>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
