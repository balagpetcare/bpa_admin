'use client'

import { useCallback } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import ZoneForm from './ZoneForm'
import ZoneContributionsTable from './ZoneContributionsTable'
import { useApi } from '@/hooks/useApi'
import { communityZonesApi } from '@/lib/api/community-zones.api'
import type { ApiError } from '@/lib/api'

export default function ZoneEditContent({ id }: { id: string }) {
  const fetchFn = useCallback(() => communityZonesApi.getById(id), [id])
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
    <>
      <ZoneForm
        zoneId={id}
        initialValues={{
          name: data.name,
          slug: data.slug,
          description: data.description ?? '',
          city: data.city,
          district: data.district,
          division: data.division,
          targetContributors: data.targetContributors,
          targetAmountBdt: Number(data.targetAmountBdt),
          targetMembers: data.targetMembers ?? 1000,
          priorityOrder: data.priorityOrder ?? 0,
          clinicStatus: data.clinicStatus,
          expectedLaunchNote: data.expectedLaunchNote ?? '',
          publicVisible: data.publicVisible,
          clinicAddress: data.clinicAddress ?? '',
          clinicPhone: data.clinicPhone ?? '',
          mapEmbedUrl: data.mapEmbedUrl ?? '',
          sortOrder: data.sortOrder,
          status: data.status,
        }}
      />
      <ZoneContributionsTable zoneId={id} />
    </>
  )
}
