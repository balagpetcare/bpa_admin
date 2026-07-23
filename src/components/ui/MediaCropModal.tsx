'use client'

import { useState, useCallback } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Cropper, { Point, Area } from 'react-easy-crop'
import { Icon } from '@iconify/react'

interface MediaCropModalProps {
  show: boolean
  onHide: () => void
  imageUrl: string
  aspectRatio?: number
  targetWidth: number
  targetHeight: number
  onCrop: (cropData: { x: number; y: number; width: number; height: number }) => Promise<void>
}

export default function MediaCropModal({ show, onHide, imageUrl, aspectRatio = 1, targetWidth, targetHeight, onCrop }: MediaCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [loading, setLoading] = useState(false)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCrop = async () => {
    if (!croppedAreaPixels) return
    setLoading(true)
    try {
      await onCrop({
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      })
      onHide()
    } catch (err) {
      console.error('Crop failed', err)
      alert('Failed to crop image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Icon icon="solar:crop-bold-duotone" className="text-primary" />
          Crop Image
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '500px', position: 'relative', background: '#333' }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <div className="flex-grow-1 me-3">
          <label className="form-label small text-muted mb-1">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="form-range"
          />
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCrop} disabled={loading || !croppedAreaPixels}>
            {loading ? 'Cropping...' : `Apply Crop (${targetWidth}x${targetHeight})`}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
