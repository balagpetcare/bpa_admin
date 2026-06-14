'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import TransparencyForm from './TransparencyForm'
import { useApi } from '@/hooks/useApi'
import { transparencyReportsApi } from '@/lib/api/transparency-reports.api'
import type { ApiError } from '@/lib/api'

export default function TransparencyEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => transparencyReportsApi.getById(id), [id])
  const { data, loading, error } = useApi(fetchFn, [id])

  if (loading) return <LoadingOverlay loading><div className="p-5" /></LoadingOverlay>
  if (error) return <ApiErrorAlert error={error as ApiError | null} />
  if (!data) return null

  return (
    <TransparencyForm
      reportId={id}
      initialValues={{
        title: data.title,
        slug: data.slug,
        reportType: data.reportType,
        periodStart: data.periodStart.slice(0, 10),
        periodEnd: data.periodEnd.slice(0, 10),
        totalCollectedBdt: Number(data.totalCollectedBdt),
        totalSpentBdt: Number(data.totalSpentBdt),
        balanceBdt: Number(data.balanceBdt),
        summaryMd: data.summaryMd ?? '',
        bodyMd: data.bodyMd ?? '',
        attachmentUrl: data.attachmentUrl ?? '',
        coverImageId: data.coverImageId ?? null,
      }}
      initialCoverImageUrl={data.coverImage?.url ?? null}
    />
  )
}
