'use client'

import MediaPickerInput from '@/components/ui/MediaPickerInput'
import type { MediaFile } from '@/types/bpa.types'

interface CommitteePhotoUploadProps {
  value: string | null | undefined
  previewUrl?: string | null
  onChange: (fileId: string | null, file: MediaFile | null) => void
}

export default function CommitteePhotoUpload({ value, previewUrl, onChange }: CommitteePhotoUploadProps) {
  return (
    <MediaPickerInput
      label="Member Photo"
      value={value}
      previewUrl={previewUrl}
      onChange={onChange}
      helpText="Square photo recommended (e.g. 400×400px)"
    />
  )
}
