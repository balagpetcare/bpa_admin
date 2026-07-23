'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import SocialImpactProgramForm from './SocialImpactProgramForm'
import { useApi } from '@/hooks/useApi'
import { socialImpactProgramsApi } from '@/lib/api/social-impact-programs.api'
import type { ApiError } from '@/lib/api'

export default function SocialImpactProgramEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => socialImpactProgramsApi.getById(id), [id])
  const { data, loading, error } = useApi(fetchFn, [id])

  if (loading)
    return (
      <LoadingOverlay loading>
        <div className="p-5" />
      </LoadingOverlay>
    )
  if (error) return <ApiErrorAlert error={error as ApiError | null} />
  if (!data) return null

  return (
    <SocialImpactProgramForm
      programId={id}
      initialValues={{
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        descriptionEn: data.descriptionEn ?? '',
        descriptionBn: data.descriptionBn ?? '',
        impactType: data.impactType,
        icon: data.icon ?? '',
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }}
    />
  )
}
