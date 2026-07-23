'use client'

import { useCallback, useState } from 'react'
import { Card, Button, Row, Col, Badge, Spinner, Form, Modal } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useApi, useApiMutation } from '@/hooks/useApi'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { mediaApi } from '@/lib/api/media.api'
import { usePermission } from '@/hooks/usePermission'
import { getMediaImageUrl } from '@/utils/media'
import MediaPreview from '@/components/ui/MediaPreview'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import MediaCropModal from '@/components/ui/MediaCropModal'
import type { CampaignMedia, CampaignMediaRole } from '@/types/bpa.types'
import { ApiError } from '@/lib/api'

const ROLE_CONFIG: Record<
  CampaignMediaRole,
  {
    label: string
    icon: string
    hint: string
    singleton: boolean
    aspectRatio: number
    targetWidth: number
    targetHeight: number
  }
> = {
  hero: {
    label: 'Hero Banner',
    icon: 'solar:star-bold-duotone',
    hint: '1600×600 recommended',
    singleton: true,
    aspectRatio: 16 / 6,
    targetWidth: 1600,
    targetHeight: 600,
  },
  thumbnail: {
    label: 'Thumbnail',
    icon: 'solar:gallery-minimalistic-bold',
    hint: '400×400 recommended',
    singleton: true,
    aspectRatio: 1,
    targetWidth: 400,
    targetHeight: 400,
  },
  mobile_banner: {
    label: 'Mobile Banner',
    icon: 'solar:smartphone-bold-duotone',
    hint: '800×1200 recommended (portrait)',
    singleton: true,
    aspectRatio: 2 / 3,
    targetWidth: 800,
    targetHeight: 1200,
  },
  gallery: {
    label: 'Gallery',
    icon: 'solar:gallery-bold-duotone',
    hint: 'Unlimited images',
    singleton: false,
    aspectRatio: 4 / 3,
    targetWidth: 800,
    targetHeight: 600,
  },
}

const ROLE_ORDER: CampaignMediaRole[] = ['hero', 'thumbnail', 'mobile_banner', 'gallery']

interface Props {
  campaignId: string
}

export default function CampaignMediaManager({ campaignId }: Props) {
  const { can } = usePermission()
  const { mutate, loading: mutating, error: mutateError } = useApiMutation<unknown, unknown>()

  const [cropTarget, setCropTarget] = useState<{ item: CampaignMedia; role: CampaignMediaRole } | null>(null)
  const [editingAlt, setEditingAlt] = useState<string | null>(null)
  const [altTextValue, setAltTextValue] = useState('')
  const [deleteError, setDeleteError] = useState<ApiError | null>(null)
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null)

  const fetchFn = useCallback(() => campaignsApi.listMedia(campaignId), [campaignId])
  const { data: items, loading, error, refetch } = useApi<CampaignMedia[]>(fetchFn, [campaignId])

  const canEdit = can('campaigns:update')

  function byRole(role: CampaignMediaRole) {
    return (items ?? []).filter((m) => m.role === role)
  }

  async function handleAttach(mediaFileId: string | null, role: CampaignMediaRole) {
    if (!mediaFileId) return
    try {
      await campaignsApi.attachMedia(campaignId, {
        mediaFileId,
        role,
      })
      await refetch()
    } catch (err: unknown) {
      alert((err as Error).message ?? 'Attachment failed')
    }
  }

  async function handleDelete(item: CampaignMedia) {
    if (deletingMediaId) return
    if (!confirm(`Delete this ${ROLE_CONFIG[item.role].label}?`)) return
    setDeleteError(null)
    setDeletingMediaId(item.id)
    try {
      const result = await mutate(() => campaignsApi.deleteMedia(campaignId, item.id), undefined)
      if (result !== null) {
        await refetch()
      }
    } finally {
      setDeletingMediaId(null)
    }
  }

  async function handleUpdateAltText(item: CampaignMedia) {
    await mutate(() => campaignsApi.updateMedia(campaignId, item.id, { altText: altTextValue }), undefined)
    setEditingAlt(null)
    await refetch()
  }

  async function handleCrop(cropData: { x: number; y: number; width: number; height: number }) {
    if (!cropTarget) return
    const cfg = ROLE_CONFIG[cropTarget.role]

    try {
      const newMediaFile = await mediaApi.crop(cropTarget.item.mediaFileId, {
        ...cropData,
        targetWidth: cfg.targetWidth,
        targetHeight: cfg.targetHeight,
      })

      if (cropTarget.role === 'gallery') {
        await campaignsApi.updateMedia(campaignId, cropTarget.item.id, { mediaFileId: newMediaFile.id })
      } else {
        await campaignsApi.attachMedia(campaignId, {
          mediaFileId: newMediaFile.id,
          role: cropTarget.role,
          altText: cropTarget.item.altText ?? undefined,
        })
      }

      setCropTarget(null)
      await refetch()
    } catch (err: unknown) {
      alert((err as Error).message ?? 'Crop failed')
    }
  }

  async function moveGalleryItem(item: CampaignMedia, direction: 'up' | 'down') {
    const gallery = byRole('gallery')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = gallery.findIndex((g) => g.id === item.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === gallery.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const ids = gallery.map((g) => g.id)
    ;[ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]]
    await mutate(() => campaignsApi.reorderMedia(campaignId, ids), undefined)
    await refetch()
  }

  if (loading)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    )
  if (error) return <ApiErrorAlert error={error as ApiError} />

  const renderRoleCard = (role: CampaignMediaRole) => {
    const roleItems = byRole(role)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
    const cfg = ROLE_CONFIG[role]
    const item = roleItems[0] || null

    return (
      <Card className="h-100 border-0 shadow-sm overflow-hidden mb-0">
        <Card.Header className="bg-white py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Icon icon={cfg.icon} className="text-primary fs-18" />
            <h6 className="mb-0 fw-bold text-dark fs-14">{cfg.label}</h6>
            {item && (
              <Badge bg="success-subtle" text="success" pill className="fs-10">
                Set
              </Badge>
            )}
          </div>
          {canEdit && !item && (
            <MediaPickerInput
              value={null}
              onChange={(id) => handleAttach(id, role)}
              emptyLabel="Add"
              uploadLabel="Upload"
              mimeTypePrefix="image/"
              customTrigger={
                <Button size="sm" variant="primary" className="btn-xs py-1 px-2">
                  <Icon icon="solar:add-circle-bold" className="me-1" />
                  Add
                </Button>
              }
            />
          )}
        </Card.Header>
        <Card.Body className="p-0 bg-light-subtle d-flex flex-column">
          {!item ? (
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-4 px-3 text-center">
              <div className="bg-light rounded-circle p-3 mb-2">
                <Icon icon={cfg.icon} style={{ fontSize: 32, opacity: 0.2 }} />
              </div>
              <div className="text-muted small fw-medium">{cfg.hint}</div>
            </div>
          ) : (
            <>
              <div
                className="position-relative bg-light preview-container"
                style={{
                  height: role === 'hero' ? '240px' : role === 'thumbnail' ? '220px' : '300px',
                  backgroundColor: '#f3f4f6',
                }}>
                <MediaPreview media={item} alt={item.altText ?? cfg.label} fit="contain" filename={item.mediaFile.originalName} />
                {canEdit && (
                  <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-center gap-1 bg-dark bg-opacity-25 backdrop-blur-sm">
                    <MediaPickerInput
                      value={null}
                      onChange={(id) => handleAttach(id, role)}
                      emptyLabel=""
                      uploadLabel="Upload"
                      mimeTypePrefix="image/"
                      customTrigger={
                        <Button size="sm" variant="light" className="btn-icon-xs shadow-sm" title="Replace">
                          <Icon icon="solar:reorder-bold-duotone" />
                        </Button>
                      }
                    />
                    <Button size="sm" variant="light" className="btn-icon-xs shadow-sm" title="Crop" onClick={() => setCropTarget({ item, role })}>
                      <Icon icon="solar:crop-bold-duotone" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="btn-icon-xs shadow-sm"
                      title="Remove"
                      disabled={mutating || deletingMediaId === item.id}
                      onClick={() => handleDelete(item)}>
                      <Icon icon={deletingMediaId === item.id ? 'svg-spinners:3-dots-fade' : 'solar:trash-bin-trash-bold'} />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-2 border-top bg-white mt-auto">
                <div
                  className="text-dark small text-truncate fw-medium"
                  style={{ cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => {
                    if (!canEdit) return
                    setEditingAlt(item.id)
                    setAltTextValue(item.altText ?? '')
                  }}>
                  {item.altText || <span className="text-muted italic">No alt text (click to edit)</span>}
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    )
  }

  const galleryItems = byRole('gallery')
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="pb-5 pt-3 container-fluid">
      <ApiErrorAlert error={deleteError ?? (mutateError as ApiError | null)} onDismiss={() => setDeleteError(null)} />

      <Row className="g-4 mb-4">
        {/* Main Column: Hero and Mobile Banner */}
        <Col lg={8}>
          <Row className="g-4">
            <Col xs={12}>{renderRoleCard('hero')}</Col>
            <Col md={6}>{renderRoleCard('mobile_banner')}</Col>
            <Col md={6}>
              <div className="h-100 d-flex flex-column align-items-center justify-content-center border rounded-3 bg-light p-4 text-center opacity-75 border-dashed">
                <Icon icon="solar:gallery-bold-duotone" className="fs-32 text-muted mb-2" />
                <p className="small text-muted mb-0">More layout space available for future role extensions</p>
              </div>
            </Col>
          </Row>
        </Col>

        {/* Sidebar Column: Thumbnail and maybe others */}
        <Col lg={4}>
          <div className="d-flex flex-column gap-4 h-100">
            <div style={{ flex: '0 0 auto' }}>{renderRoleCard('thumbnail')}</div>
            <Card className="flex-grow-1 border-0 shadow-sm overflow-hidden">
              <Card.Header className="bg-white py-2 px-3 border-bottom">
                <h6 className="mb-0 fw-bold text-dark fs-14">Media Stats</h6>
              </Card.Header>
              <Card.Body className="p-3">
                <ul className="list-unstyled mb-0 small text-muted">
                  <li className="d-flex justify-content-between mb-2">
                    <span>Total Media:</span>
                    <span className="fw-bold text-dark">{items?.length ?? 0}</span>
                  </li>
                  <li className="d-flex justify-content-between mb-2">
                    <span>Gallery Images:</span>
                    <span className="fw-bold text-dark">{galleryItems.length}</span>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span>Storage Use:</span>
                    <span className="fw-bold text-dark">
                      {items ? (items.reduce((acc, curr) => acc + Number(curr.mediaFile.sizeBytes), 0) / (1024 * 1024)).toFixed(2) : 0} MB
                    </span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Gallery Section Full Width */}
      <Card className="border-0 shadow-sm overflow-hidden mb-4">
        <Card.Header className="bg-white py-3 px-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Icon icon={ROLE_CONFIG.gallery.icon} className="text-primary fs-20" />
            <h6 className="mb-0 fw-bold text-dark">Campaign Gallery</h6>
            <Badge bg="secondary-subtle" text="secondary" pill className="ms-1">
              {galleryItems.length}
            </Badge>
          </div>
          {canEdit && (
            <MediaPickerInput
              value={null}
              onChange={(id) => handleAttach(id, 'gallery')}
              emptyLabel="Add Images"
              uploadLabel="Upload New"
              mimeTypePrefix="image/"
              customTrigger={
                <Button size="sm" variant="primary">
                  <Icon icon="solar:add-circle-bold" className="me-1" />
                  Add Images
                </Button>
              }
            />
          )}
        </Card.Header>
        <Card.Body className={galleryItems.length === 0 ? 'bg-light-subtle' : ''}>
          {galleryItems.length === 0 ? (
            <div className="text-center text-muted py-5">
              <Icon icon={ROLE_CONFIG.gallery.icon} style={{ fontSize: 48, opacity: 0.1 }} />
              <p className="mt-2 mb-0 fw-medium">No gallery images attached</p>
              <div className="small text-muted">{ROLE_CONFIG.gallery.hint}</div>
            </div>
          ) : (
            <Row className="g-3">
              {galleryItems.map((item, idx) => (
                <Col key={item.id} xs={6} md={4} lg={3} xl={2}>
                  <div className="card h-100 border shadow-none overflow-hidden group-hover-actions">
                    <div className="position-relative bg-light" style={{ aspectRatio: '4/3' }}>
                      <MediaPreview media={item} alt={item.altText ?? 'Gallery'} fit="cover" filename={item.mediaFile.originalName} />
                      {canEdit && (
                        <div className="position-absolute top-0 end-0 m-1 d-flex flex-column gap-1 opacity-0 group-hover-visible z-3">
                          <Button
                            size="sm"
                            variant="light"
                            className="btn-icon-xs shadow-sm"
                            title="Crop"
                            onClick={() => setCropTarget({ item, role: 'gallery' })}>
                            <Icon icon="solar:crop-bold-duotone" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="btn-icon-xs shadow-sm"
                            title="Remove"
                            disabled={mutating || deletingMediaId === item.id}
                            onClick={() => handleDelete(item)}>
                            <Icon icon={deletingMediaId === item.id ? 'svg-spinners:3-dots-fade' : 'solar:trash-bin-trash-bold'} />
                          </Button>
                        </div>
                      )}
                      {canEdit && (
                        <div className="position-absolute bottom-0 start-0 w-100 p-1 d-flex justify-content-center gap-1 bg-dark bg-opacity-25 opacity-0 group-hover-visible">
                          <Button
                            size="sm"
                            variant="light"
                            className="btn-xs py-0 px-1"
                            disabled={idx === 0 || mutating}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveGalleryItem(item, 'up')
                            }}>
                            <Icon icon="solar:arrow-left-bold" />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="btn-xs py-0 px-1"
                            disabled={idx === galleryItems.length - 1 || mutating}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveGalleryItem(item, 'down')
                            }}>
                            <Icon icon="solar:arrow-right-bold" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-1 px-2 border-top bg-white">
                      <div className="text-muted text-truncate" style={{ fontSize: '10px' }}>
                        {item.altText || item.mediaFile.originalName}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {cropTarget && (
        <MediaCropModal
          show={!!cropTarget}
          onHide={() => setCropTarget(null)}
          imageUrl={getMediaImageUrl(cropTarget.item)}
          aspectRatio={ROLE_CONFIG[cropTarget.role].aspectRatio}
          targetWidth={ROLE_CONFIG[cropTarget.role].targetWidth}
          targetHeight={ROLE_CONFIG[cropTarget.role].targetHeight}
          onCrop={handleCrop}
        />
      )}

      {editingAlt && (
        <Modal show={true} onHide={() => setEditingAlt(null)} centered size="sm">
          <Modal.Header closeButton className="py-2 px-3">
            <Modal.Title className="fs-14">Edit Alt Text</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form.Control
              size="sm"
              autoFocus
              placeholder="Descriptive text..."
              value={altTextValue}
              onChange={(e) => setAltTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateAltText(items!.find((i) => i.id === editingAlt)!)}
            />
          </Modal.Body>
          <Modal.Footer className="py-2 px-3">
            <Button size="sm" variant="light" onClick={() => setEditingAlt(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={() => handleUpdateAltText(items!.find((i) => i.id === editingAlt)!)}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <style jsx global>{`
        .group-hover-visible {
          transition: opacity 0.2s ease-in-out;
        }
        .group-hover-actions:hover .group-hover-visible {
          opacity: 1 !important;
        }
        .btn-icon-xs {
          width: 24px;
          height: 24px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 14px;
        }
        .fs-18 {
          font-size: 18px;
        }
        .fs-14 {
          font-size: 14px;
        }
        .fs-10 {
          font-size: 10px;
        }
        .fs-32 {
          font-size: 32px;
        }
        .btn-xs {
          font-size: 11px;
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  )
}
