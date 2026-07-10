'use client'

import { use, useCallback } from 'react'
import PageTItle from '@/components/PageTItle'
import { useApi } from '@/hooks/useApi'
import { campaignsApi } from '@/lib/api/campaigns.api'
import CampaignForm from '../../components/CampaignForm'
import LoadingOverlay from '@/components/ui/LoadingOverlay'

export default function CampaignEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const fetchFn = useCallback(() => campaignsApi.getById(id), [id])
  const { data: campaign, loading } = useApi(fetchFn, [id])

  if (loading)
    return (
      <LoadingOverlay loading>
        <div style={{ minHeight: 200 }} />
      </LoadingOverlay>
    )
  if (!campaign) return null

  const initialValues = {
    title: campaign.title,
    slug: campaign.slug,
    description: campaign.description ?? '',
    campaignType: campaign.campaignType,
    startDate: campaign.startDate.slice(0, 16),
    endDate: campaign.endDate.slice(0, 16),
    registrationOpenAt: campaign.registrationOpenAt?.slice(0, 16) ?? '',
    registrationCloseAt: campaign.registrationCloseAt?.slice(0, 16) ?? '',
    basePriceBdt: campaign.basePriceBdt,
    maxPetsPerBooking: String(campaign.maxPetsPerBooking),
    allowedPetTypes: campaign.allowedPetTypes ?? [],
    metadata: campaign.metadata ?? null,
  }

  return (
    <>
      <PageTItle title="Edit Campaign" />
      <CampaignForm campaignId={id} initialValues={initialValues} />
    </>
  )
}
