'use client'

import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import { getImpactStory } from '@/lib/api/donations.api'
import ImpactStoryForm from '../components/ImpactStoryForm'
export default function EditImpactStoryPage() {
  const { id } = useParams<{ id: string }>()
  const fn = useCallback(() => getImpactStory(id), [id])
  const { data, loading } = useApi(fn, [id])

  if (loading)
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" />
      </div>
    )
  if (!data) return null

  return <ImpactStoryForm storyId={id} initial={data} />
}
