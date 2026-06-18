'use client'

import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import { getCampaign } from '@/lib/api/donations.api'
import DonationCampaignForm from '../components/DonationCampaignForm'

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>()
  const fn = useCallback(() => getCampaign(id), [id])
  const { data, loading } = useApi(fn, [id])

  if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary" /></div>
  if (!data) return null

  return <DonationCampaignForm campaignId={id} initial={data} />
}
