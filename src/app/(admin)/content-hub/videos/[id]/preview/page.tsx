'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Badge, Card } from 'react-bootstrap'
import { contentApi, ContentPost } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'

export default function PreviewVideoPage() {
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link href={`/content-hub/videos/${id}/edit`} className="btn btn-light btn-sm">
          ← Back to Edit
        </Link>
        {post?.slug ? (
          <a href={`/api/backend/public/videos/${post.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">
            Open Public API Payload
          </a>
        ) : null}
      </div>

      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />

      <LoadingOverlay loading={loading}>
        {post ? (
          <Card>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg={post.status === 'published' ? 'success' : post.status === 'archived' ? 'secondary' : 'warning'}>
                  {post.status}
                </Badge>
                {post.category?.nameEn ? <Badge bg="light" text="dark">{post.category.nameEn}</Badge> : null}
                {post.publishedAt ? <Badge bg="info">Publishes: {new Date(post.publishedAt).toLocaleString()}</Badge> : null}
              </div>

              <h1 className="h3">{post.titleEn}</h1>
              <p className="text-muted mb-1">{post.titleBn}</p>
              <p className="text-muted">/{post.slug}</p>

              {post.coverImageUrl ? (
                <img src={post.coverImageUrl} alt={post.titleEn} className="img-fluid rounded mb-3" style={{ maxHeight: 320, objectFit: 'cover' }} />
              ) : null}

              {post.summaryEn ? <p>{post.summaryEn}</p> : null}
              {post.summaryBn ? <p>{post.summaryBn}</p> : null}

              {post.videoUrl ? (
                <Card className="mb-3">
                  <Card.Body>
                    <div className="small text-muted mb-1">External Video Source</div>
                    <div>{post.videoProvider ?? post.videoSourceType}</div>
                    <div className="text-break">{post.videoUrl}</div>
                  </Card.Body>
                </Card>
              ) : null}

              {post.videoFileUrl ? (
                <Card className="mb-3">
                  <Card.Body>
                    <div className="small text-muted mb-2">Uploaded Video Preview</div>
                    <video src={post.videoFileUrl} controls preload="metadata" style={{ width: '100%', maxHeight: 420 }} />
                  </Card.Body>
                </Card>
              ) : null}

              {post.bodyEn ? <div className="mb-4" dangerouslySetInnerHTML={{ __html: post.bodyEn }} /> : null}
              {post.bodyBn ? <div dangerouslySetInnerHTML={{ __html: post.bodyBn }} /> : null}
            </Card.Body>
          </Card>
        ) : (
          !loading && (
            <Card>
              <Card.Body className="text-muted">Preview unavailable for this video.</Card.Body>
            </Card>
          )
        )}
      </LoadingOverlay>
    </div>
  )
}
