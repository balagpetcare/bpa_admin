'use client'

import { useCallback, useState } from 'react'
import { Card, Button, Row, Col, Badge, Spinner, Alert, Form, Modal } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useApi, useApiMutation } from '@/hooks/useApi'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { usePermission } from '@/hooks/usePermission'
import type { ApiError } from '@/lib/api'

interface Props { campaignId: string }

export default function CampaignVideosManager({ campaignId }: Props) {
  const { can } = usePermission()
  const { mutate, loading: mutating, error: mutateError } = useApiMutation<unknown, unknown>()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    caption: '',
    isActive: true
  })

  const fetchFn = useCallback(() => campaignsApi.listVideos(campaignId), [campaignId])
  const { data: videos, loading, error, refetch } = useApi<any[]>(fetchFn, [campaignId])

  const canEdit = can('campaigns:update')

  async function handleDelete(video: any) {
    if (!confirm(`Delete video "${video.title}"?`)) return
    await mutate(() => campaignsApi.deleteVideo(campaignId, video.id), undefined)
    await refetch()
  }

  async function handleToggleStatus(video: any) {
    await mutate(() => campaignsApi.updateVideo(campaignId, video.id, { isActive: !video.isActive }), undefined)
    await refetch()
  }

  async function handleSave() {
    try {
      if (editingVideo) {
        await mutate(() => campaignsApi.updateVideo(campaignId, editingVideo.id, formData), undefined)
      } else {
        await mutate(() => campaignsApi.addVideo(campaignId, formData), undefined)
      }
      setShowAddModal(false)
      setEditingVideo(null)
      await refetch()
    } catch (err: unknown) {
      alert((err as Error).message ?? 'Save failed')
    }
  }

  function openAddModal() {
    setFormData({ title: '', youtubeUrl: '', thumbnailUrl: '', caption: '', isActive: true })
    setEditingVideo(null)
    setShowAddModal(true)
  }

  function openEditModal(video: any) {
    setFormData({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      caption: video.caption || '',
      isActive: video.isActive
    })
    setEditingVideo(video)
    setShowAddModal(true)
  }

  async function moveItem(item: any, direction: 'up' | 'down') {
    const list = (videos ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = list.findIndex(g => g.id === item.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === list.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const ids = list.map(g => g.id)
    ;[ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]]
    await mutate(() => campaignsApi.reorderVideos(campaignId, ids), undefined)
    await refetch()
  }

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>
  if (error) return <ApiErrorAlert error={error as ApiError} />

  const sortedVideos = (videos ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="pb-5 container-fluid">
      {mutateError && <Alert variant="danger" className="mb-4">{(mutateError as ApiError).message}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden mb-4">
        <Card.Header className="bg-white py-3 px-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Icon icon="logos:youtube-icon" className="text-danger fs-20" />
            <h6 className="mb-0 fw-bold text-dark">Campaign Videos</h6>
            <Badge bg="secondary-subtle" text="secondary" pill className="ms-1">{sortedVideos.length}</Badge>
          </div>
          {canEdit && (
            <Button size="sm" variant="danger" onClick={openAddModal}>
              <Icon icon="solar:video-library-bold" className="me-1" />Add Video
            </Button>
          )}
        </Card.Header>
        <Card.Body className={sortedVideos.length === 0 ? 'bg-light-subtle' : ''}>
          {sortedVideos.length === 0 ? (
            <div className="text-center text-muted py-5">
              <Icon icon="solar:video-frame-bold-duotone" style={{ fontSize: 48, opacity: 0.1 }} />
              <p className="mt-2 mb-0 fw-medium">No videos added yet</p>
              <div className="small text-muted">Add YouTube links to show in the app</div>
            </div>
          ) : (
            <Row className="g-3">
              {sortedVideos.map((video, idx) => {
                const videoIdMatch = video.youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
                const ytId = videoIdMatch ? videoIdMatch[1] : null
                const thumb = video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : `https://placehold.co/400x300?text=No+Thumbnail`)
                
                return (
                  <Col key={video.id} xs={12} md={6} lg={4} xl={3}>
                    <div className="card h-100 border shadow-none overflow-hidden group-hover-actions">
                      <div className="position-relative bg-light" style={{ aspectRatio: '16/9' }}>
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-100 h-100 object-fit-cover"
                        />
                        {!video.isActive && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center z-1">
                            <Badge bg="secondary">Inactive</Badge>
                          </div>
                        )}
                        {canEdit && (
                          <div className="position-absolute top-0 end-0 m-1 d-flex flex-column gap-1 opacity-0 group-hover-visible z-3">
                            <Button size="sm" variant="light" className="btn-icon-xs shadow-sm" title="Edit"
                              onClick={() => openEditModal(video)}>
                              <Icon icon="solar:pen-bold" />
                            </Button>
                            <Button size="sm" variant={video.isActive ? "warning" : "success"} className="btn-icon-xs shadow-sm" title={video.isActive ? "Deactivate" : "Activate"}
                              onClick={() => handleToggleStatus(video)}>
                              <Icon icon={video.isActive ? "solar:eye-closed-bold" : "solar:eye-bold"} />
                            </Button>
                            <Button size="sm" variant="danger" className="btn-icon-xs shadow-sm" title="Remove"
                              disabled={mutating}
                              onClick={() => handleDelete(video)}>
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
                          </div>
                        )}
                        {canEdit && (
                          <div className="position-absolute bottom-0 start-0 w-100 p-1 d-flex justify-content-center gap-1 bg-dark bg-opacity-25 opacity-0 group-hover-visible z-3">
                            <Button size="sm" variant="light" className="btn-xs py-0 px-1"
                              disabled={idx === 0 || mutating}
                              onClick={(e) => { e.stopPropagation(); moveItem(video, 'up') }}>
                              <Icon icon="solar:arrow-left-bold" />
                            </Button>
                            <Button size="sm" variant="light" className="btn-xs py-0 px-1"
                              disabled={idx === sortedVideos.length - 1 || mutating}
                              onClick={(e) => { e.stopPropagation(); moveItem(video, 'down') }}>
                              <Icon icon="solar:arrow-right-bold" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-top bg-white">
                         <div className="fw-bold text-dark text-truncate fs-14">{video.title}</div>
                         <div className="text-muted text-truncate mt-1" style={{ fontSize: '12px' }}>
                            {video.caption || 'No caption'}
                         </div>
                      </div>
                    </div>
                  </Col>
                )
              })}
            </Row>
          )}
        </Card.Body>
      </Card>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">{editingVideo ? 'Edit Video' : 'Add YouTube Video'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">Title *</Form.Label>
              <Form.Control 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Vaccination Highlights"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">YouTube URL *</Form.Label>
              <Form.Control 
                value={formData.youtubeUrl} 
                onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} 
                placeholder="https://youtube.com/watch?v=..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">Thumbnail URL (Optional)</Form.Label>
              <Form.Control 
                value={formData.thumbnailUrl} 
                onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} 
                placeholder="Leave blank to auto-fetch from YouTube"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">Caption/Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea"
                rows={2}
                value={formData.caption} 
                onChange={e => setFormData({...formData, caption: e.target.value})} 
              />
            </Form.Group>
            <Form.Group>
              <Form.Check 
                type="switch"
                id="is-active-switch"
                label="Active (Visible in App)"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleSave} disabled={mutating || !formData.title || !formData.youtubeUrl}>
            {mutating ? <Spinner size="sm" /> : 'Save Video'}
          </Button>
        </Modal.Footer>
      </Modal>
      
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
        .fs-14 { font-size: 14px; }
        .fs-16 { font-size: 16px; }
        .btn-xs { font-size: 11px; }
      `}</style>
    </div>
  )
}
