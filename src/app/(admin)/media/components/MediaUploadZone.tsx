'use client'

import { useState } from 'react'
import { Button, ProgressBar, Alert } from 'react-bootstrap'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import { mediaApi } from '@/lib/api/media.api'
import type { UploadFileType } from '@/types/component-props'
import type { MediaFile } from '@/types/bpa.types'

interface MediaUploadZoneProps {
  onUploaded: (files: MediaFile[]) => void
}

export default function MediaUploadZone({ onUploaded }: MediaUploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<UploadFileType[]>([])

  const handleFileSelect = (files: UploadFileType[]) => {
    setPendingFiles(files)
    setUploadError(null)
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return
    setUploading(true)
    setProgress(0)
    setUploadError(null)
    const uploaded: MediaFile[] = []
    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const result = await mediaApi.upload(pendingFiles[i])
        uploaded.push(result)
        setProgress(Math.round(((i + 1) / pendingFiles.length) * 100))
      }
      setPendingFiles([])
      onUploaded(uploaded)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {uploadError && (
        <Alert variant="danger" dismissible onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}
      <DropzoneFormInput
        text="Drop files here or click to browse"
        helpText="Max 10 MB per file. Images, PDFs and documents accepted."
        showPreview
        iconProps={{ icon: 'solar:cloud-upload-bold-duotone', fontSize: 40 }}
        onFileUpload={handleFileSelect}
      />
      {uploading && <ProgressBar animated now={progress} label={`${progress}%`} className="mt-2" />}
      {pendingFiles.length > 0 && !uploading && (
        <div className="d-flex justify-content-end mt-2">
          <Button variant="primary" onClick={handleUpload}>
            Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}
