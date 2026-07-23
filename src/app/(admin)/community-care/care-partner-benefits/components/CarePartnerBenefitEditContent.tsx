'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import CarePartnerBenefitForm from './CarePartnerBenefitForm'
import { useApi } from '@/hooks/useApi'
import { carePartnerBenefitsApi } from '@/lib/api/care-partner-benefits.api'
import type { ApiError } from '@/lib/api'

export default function CarePartnerBenefitEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => carePartnerBenefitsApi.getById(id), [id])
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
    <CarePartnerBenefitForm
      benefitId={id}
      initialValues={{
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        descriptionEn: data.descriptionEn ?? '',
        descriptionBn: data.descriptionBn ?? '',
        icon: data.icon ?? '',
        category: data.category,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }}
    />
  )
}
