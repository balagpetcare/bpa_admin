'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { contentApi, ContentPost } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import ContentPostForm from '../../../components/ContentPostForm'

export default function EditVideoPage() {
  const params = useParams()
  const id = params.id as string

  const [post, setPost] = useState<ContentPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    contentApi
      .getPostById(id)
      .then(setPost)
      .catch((err) => setError(err as ApiError))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container-fluid py-4 min-vh-50 d-flex align-items-center justify-content-center">
        <LoadingOverlay loading={true}>
          <div className="py-5 text-center text-muted">Loading post...</div>
        </LoadingOverlay>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />
      {post && <ContentPostForm existing={post} defaultType="VIDEO" />}
    </div>
  )
}
