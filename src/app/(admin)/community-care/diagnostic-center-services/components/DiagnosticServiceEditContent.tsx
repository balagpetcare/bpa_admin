'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import DiagnosticServiceForm from './DiagnosticServiceForm'
import { useApi } from '@/hooks/useApi'
import { diagnosticCenterServicesApi } from '@/lib/api/diagnostic-center-services.api'
import type { ApiError } from '@/lib/api'

export default function DiagnosticServiceEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => diagnosticCenterServicesApi.getById(id), [id])
  const { data, loading, error } = useApi(fetchFn, [id])

  if (loading) return <LoadingOverlay loading><div className="p-5" /></LoadingOverlay>
  if (error) return <ApiErrorAlert error={error as ApiError | null} />
  if (!data) return null

  return (
    <DiagnosticServiceForm
      serviceId={id}
      initialValues={{
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        descriptionEn: data.descriptionEn ?? '',
        descriptionBn: data.descriptionBn ?? '',
        category: data.category,
        icon: data.icon ?? '',
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }}
    />
  )
}
