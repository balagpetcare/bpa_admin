'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import RoadmapItemForm from './RoadmapItemForm'
import { useApi } from '@/hooks/useApi'
import { roadmapItemsApi } from '@/lib/api/roadmap-items.api'
import type { ApiError } from '@/lib/api'

export default function RoadmapItemEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => roadmapItemsApi.getById(id), [id])
  const { data, loading, error } = useApi(fetchFn, [id])

  if (loading) return <LoadingOverlay loading><div className="p-5" /></LoadingOverlay>
  if (error) return <ApiErrorAlert error={error as ApiError | null} />
  if (!data) return null

  return (
    <RoadmapItemForm
      itemId={id}
      initialValues={{
        phase: data.phase,
        year: data.year,
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        descriptionEn: data.descriptionEn ?? '',
        descriptionBn: data.descriptionBn ?? '',
        status: data.status,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }}
    />
  )
}
