'use client'

import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import { useApi } from '@/hooks/useApi'
import { heroSliderApi } from '@/lib/api/hero-slider.api'
import type { ApiError } from '@/lib/api'
import HeroSliderForm from './HeroSliderForm'

export default function HeroSliderEditContent({ id }: { id: string }) {
  const { data, loading, error } = useApi(() => heroSliderApi.getById(id), [id])

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    )
  if (error) return <ApiErrorAlert error={error as ApiError} />
  if (!data) return <EmptyState title="Hero slide not found" description="The requested slide could not be loaded." />

  return <HeroSliderForm slide={data} />
}
