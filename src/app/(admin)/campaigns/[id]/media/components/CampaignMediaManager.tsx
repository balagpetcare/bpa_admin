'use client'

import { useCallback, useRef, useState } from 'react'
import { Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useApi, useApiMutation } from '@/hooks/useApi'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { usePermission } from '@/hooks/usePermission'
import type { CampaignMedia, CampaignMediaRole } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const ROLE_CONFIG: Record<CampaignMediaRole, { label: string; icon: string; hint: string; singleton: boolean }> = {
  hero:          { label: 'Hero Banner',    icon: 'solar:star-bold-duotone',       hint: '1600×600 recommended — full-width banner on campaign detail page',   singleton: true  },
  thumbnail:     { label: 'Thumbnail',      icon: 'solar:gallery-minimalistic-bold', hint: '400×400 recommended — used on campaign cards and list views',      singleton: true  },
  mobile_banner: { label: 'Mobile Banner',  icon: 'solar:smartphone-bold-duotone', hint: '800×400 recommended — shown on mobile devices',                     singleton: true  },
  gallery:       { label: 'Gallery',        icon: 'solar:gallery-bold-duotone',    hint: 'Unlimited images — shown in the gallery carousel on the detail page', singleton: false },
}

const SINGLETON_ROLES: CampaignMediaRole[] = ['hero', 'thumbnail', 'mobile_banner']
const ROLE_ORDER: CampaignMediaRole[] = ['hero', 'thumbnail', 'mobile_banner', 'gallery']

interface Props { campaignId: string }

export default function CampaignMediaManager({ campaignId }: Props) {
  const { can } = usePermission()
  const { mutate, loading: mutating, error: mutateError } = useApiMutation<unknown, unknown>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadRole, setUploadRole] = useState<CampaignMediaRole>('hero')
  const [altTextInput, setAltTextInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchFn = useCallback(() => campaignsApi.listMedia(campaignId), [campaignId])
  const { data: items, loading, error, refetch } = useApi<CampaignMedia[]>(fetchFn, [campaignId])

  const canEdit = can('campaigns:update')

  function byRole(role: CampaignMediaRole) {
    return (items ?? []).filter(m => m.role === role)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      await campaignsApi.uploadMedia(campaignId, file, uploadRole, altTextInput || undefined)
      setAltTextInput('')
      refetch()
    } catch (err: unknown) {
      setUploadError((err as Error).message ?? 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(item: CampaignMedia) {
    if (!confirm(`Delete this ${ROLE_CONFIG[item.role].label}?`)) return
    await mutate(() => campaignsApi.deleteMedia(campaignId, item.id), undefined)
    refetch()
  }

  async function moveGalleryItem(item: CampaignMedia, direction: 'up' | 'down') {
    const gallery = byRole('gallery').slice().sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = gallery.findIndex(g => g.id === item.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === gallery.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const ids = gallery.map(g => g.id)
    ;[ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]]
    await mutate(() => campaignsApi.reorderMedia(campaignId, ids), undefined)
    refetch()
  }

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>
  if (error) return <ApiErrorAlert error={error as ApiError} />

  return (
    <div>
      {mutateError && <Alert variant="danger">{(mutateError as ApiError).message}</Alert>}

      {/* Upload Panel */}
      {canEdit && (
        <Card className="mb-4 border-primary-subtle">
          <Card.Header className="bg-primary-subtle">
            <h6 className="mb-0 d-flex align-items-center gap-2">
              <Icon icon="solar:upload-bold-duotone" />
              Upload Media
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <label className="form-label form-label-sm fw-semibold">Role</label>
                <select className="form-select form-select-sm" value={uploadRole}
                  onChange={e => setUploadRole(e.target.value as CampaignMediaRole)}>
                  {ROLE_ORDER.map(r => (
                    <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                  ))}
                </select>
                <div className="form-text">{ROLE_CONFIG[uploadRole].hint}</div>
              </Col>
              <Col md={4}>
                <label className="form-label form-label-sm fw-semibold">Alt Text <span className="text-muted fw-normal">(optional)</span></label>
                <input type="text" className="form-control form-control-sm" placeholder="Describe the image..."
                  value={altTextInput} onChange={e => setAltTextInput(e.target.value)} />
              </Col>
              <Col md={3}>
                <label className="form-label form-label-sm fw-semibold">File</label>
                <input ref={fileInputRef} type="file" className="form-control form-control-sm"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleUpload} disabled={uploading} />
              </Col>
              <Col md={2} className="text-end">
                {uploading && <Spinner animation="border" size="sm" className="me-2" />}
                {SINGLETON_ROLES.includes(uploadRole) && byRole(uploadRole).length > 0 && (
                  <div className="text-warning small">⚠ Will replace existing</div>
                )}
              </Col>
            </Row>
            {uploadError && <Alert variant="danger" className="mt-3 mb-0 py-2">{uploadError}</Alert>}
          </Card.Body>
        </Card>
      )}

      {/* Media by Role */}
      {ROLE_ORDER.map(role => {
        const roleItems = byRole(role).slice().sort((a, b) => a.sortOrder - b.sortOrder)
        const cfg = ROLE_CONFIG[role]
        return (
          <Card key={role} className="mb-4">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <Icon icon={cfg.icon} />
                {cfg.label}
                <Badge bg="secondary" pill className="ms-1">{roleItems.length}</Badge>
                {cfg.singleton && <span className="text-muted small fw-normal">(1 max)</span>}
              </h6>
            </Card.Header>
            <Card.Body>
              {roleItems.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon={cfg.icon} style={{ fontSize: 32, opacity: 0.3 }} />
                  <p className="mt-2 mb-0 small">No {cfg.label.toLowerCase()} uploaded yet</p>
                  <p className="text-muted small">{cfg.hint}</p>
                </div>
              ) : (
                <Row className="g-3">
                  {roleItems.map((item, idx) => (
                    <Col key={item.id} xs={12} sm={6} md={role === 'gallery' ? 3 : 6} lg={role === 'gallery' ? 3 : 4}>
                      <div className="border rounded overflow-hidden position-relative bg-light" style={{ aspectRatio: role === 'hero' ? '16/5' : role === 'thumbnail' ? '1/1' : role === 'mobile_banner' ? '2/1' : '4/3' }}>
                        <Image
                          src={item.mediaFile.url}
                          alt={item.altText ?? cfg.label}
                          fill
                          sizes="(max-width: 576px) 100vw, 300px"
                          className="object-fit-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      {item.altText && (
                        <p className="text-muted small mt-1 mb-1 text-truncate">{item.altText}</p>
                      )}
                      {canEdit && (
                        <div className="d-flex gap-1 mt-1 flex-wrap">
                          {role === 'gallery' && (
                            <>
                              <Button size="sm" variant="outline-secondary" className="py-0 px-1"
                                disabled={idx === 0 || mutating}
                                onClick={() => moveGalleryItem(item, 'up')}>
                                <Icon icon="solar:arrow-up-bold" />
                              </Button>
                              <Button size="sm" variant="outline-secondary" className="py-0 px-1"
                                disabled={idx === roleItems.length - 1 || mutating}
                                onClick={() => moveGalleryItem(item, 'down')}>
                                <Icon icon="solar:arrow-down-bold" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline-danger" className="py-0 px-1 ms-auto"
                            disabled={mutating}
                            onClick={() => handleDelete(item)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        </div>
                      )}
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        )
      })}
    </div>
  )
}
