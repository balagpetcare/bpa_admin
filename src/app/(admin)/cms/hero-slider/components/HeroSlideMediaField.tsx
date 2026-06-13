'use client'

import MediaPickerInput from '@/components/ui/MediaPickerInput'
import type { MediaFile, HeroSlideMediaRef } from '@/types/bpa.types'

interface HeroSlideMediaFieldProps {
  label: string
  value: HeroSlideMediaRef | null
  onChange: (value: HeroSlideMediaRef | null) => void
  helpText?: string
  mimeTypePrefix: 'image/' | 'video/'
}

export default function HeroSlideMediaField({
  label,
  value,
  onChange,
  helpText,
  mimeTypePrefix,
}: HeroSlideMediaFieldProps) {
  return (
    <MediaPickerInput
      label={label}
      value={value?.id ?? null}
      previewUrl={value?.url ?? null}
      previewMimeType={value?.mimeType ?? null}
      onChange={(_, file: MediaFile | null) => {
        if (!file) {
          onChange(null)
          return
        }

        onChange({
          id: file.id,
          url: file.url,
          mimeType: file.mimeType,
          altText: file.altText ?? null,
        })
      }}
      helpText={helpText}
      mimeTypePrefix={mimeTypePrefix}
      dialogTitle={mimeTypePrefix === 'video/' ? 'Select Video from Media Library' : 'Select Image from Media Library'}
      emptyLabel={mimeTypePrefix === 'video/' ? 'Select video' : 'Select image'}
      uploadLabel={mimeTypePrefix === 'video/' ? 'Upload video' : 'Upload image'}
      accept={mimeTypePrefix === 'video/' ? 'video/*' : 'image/*'}
    />
  )
}
