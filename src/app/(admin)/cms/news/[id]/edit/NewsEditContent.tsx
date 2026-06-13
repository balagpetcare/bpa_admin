'use client'

import { useApi } from '@/hooks/useApi'
import { newsApi } from '@/lib/api/news.api'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import NewsForm from '../../components/NewsForm'
import type { ApiError } from '@/lib/api'

export default function NewsEditContent({ id }: { id: string }) {
  const { data, loading, error } = useApi(() => newsApi.getById(id), [id])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
  if (error) return <ApiErrorAlert error={error as ApiError} />
  if (!data) return <EmptyState title="Article not found" />

  return <NewsForm existing={data} />
}
