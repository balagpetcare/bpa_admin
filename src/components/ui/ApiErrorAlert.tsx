'use client'

import { Alert } from 'react-bootstrap'
import { ApiError } from '@/lib/api'
import type { MediaFileInUseDetail } from '@/types/bpa.types'

interface ApiErrorAlertProps {
  error: ApiError | Error | null | undefined
  onDismiss?: () => void
}

// Displays a BPA API error envelope in a Bootstrap Alert.
export default function ApiErrorAlert({ error, onDismiss }: ApiErrorAlertProps) {
  if (!error) return null

  const message = error.message || 'An unexpected error occurred.'
  const details = error instanceof ApiError && error.details?.length ? error.details : null
  const mediaInUse = error instanceof ApiError && error.code === 'MEDIA_FILE_IN_USE' ? (error.details?.[0] as MediaFileInUseDetail | undefined) : null

  return (
    <Alert variant="danger" dismissible={!!onDismiss} onClose={onDismiss}>
      <Alert.Heading className="fs-6 mb-1">{error instanceof ApiError ? `Error (${error.code})` : 'Error'}</Alert.Heading>
      <p className="mb-0">{message}</p>
      {mediaInUse && mediaInUse.referenceTypes.length > 0 && (
        <div className="mt-2">
          <div className="small fw-semibold mb-1">Currently used in:</div>
          <ul className="mb-0 ps-3">
            {mediaInUse.referenceTypes.map((ref) => (
              <li key={ref.type} className="small">
                {ref.label} ({ref.count})
                {ref.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="text-muted">
                    {item.label ?? item.id}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
      {details && (
        <ul className="mb-0 mt-1 ps-3">
          {(details as unknown[]).flatMap((d, i) => {
            if (!d || typeof d !== 'object' || !('message' in d)) return []
            const messageText = typeof (d as { message?: unknown }).message === 'string' ? (d as { message: string }).message : String(d)
            const rawPath = 'path' in d ? (d as { path?: unknown }).path : undefined
            const path = typeof rawPath === 'string' ? rawPath : null
            return [
              <li key={i} className="small">
                {path && <strong className="me-1">{path}:</strong>}
                {messageText}
              </li>,
            ]
          })}
        </ul>
      )}
    </Alert>
  )
}
