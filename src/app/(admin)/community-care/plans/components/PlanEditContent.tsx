'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import PlanForm from './PlanForm'
import { useApi } from '@/hooks/useApi'
import { contributionPlansApi } from '@/lib/api/contribution-plans.api'
import type { ApiError } from '@/lib/api'

export default function PlanEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => contributionPlansApi.getById(id), [id])
  const { data, loading, error } = useApi(fetchFn, [id])

  if (loading) return <LoadingOverlay loading><div className="p-5" /></LoadingOverlay>
  if (error) return <ApiErrorAlert error={error as ApiError | null} />
  if (!data) return null

  return (
    <PlanForm
      planId={id}
      initialValues={{
        title: data.title,
        slug: data.slug,
        amountBdt: Number(data.amountBdt),
        description: data.description ?? '',
        legalDisclaimerText: data.legalDisclaimerText ?? '',
        benefitsSummaryJson: data.benefitsSummaryJson ?? [],
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      }}
    />
  )
}
