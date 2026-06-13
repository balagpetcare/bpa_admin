'use client'

import MediaPickerInput from '@/components/ui/MediaPickerInput'
import type { MediaFile } from '@/types/bpa.types'

interface SeoOgImagePickerProps {
  value: string | null
  previewUrl?: string | null
  onChange: (fileId: string | null, file: MediaFile | null) => void
}

export default function SeoOgImagePicker({ value, previewUrl, onChange }: SeoOgImagePickerProps) {
  return (
    <MediaPickerInput
      label="OG Image"
      helpText="Recommended: 1200×630px. Used when the page is shared on social media."
      value={value}
      previewUrl={previewUrl}
      onChange={onChange}
    />
  )
}
