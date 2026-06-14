'use client'

import { Alert } from 'react-bootstrap'
import { ApiError } from '@/lib/api'

interface ApiErrorAlertProps {
  error: ApiError | Error | null | undefined
  onDismiss?: () => void
}

// Displays a BPA API error envelope in a Bootstrap Alert.
export default function ApiErrorAlert({ error, onDismiss }: ApiErrorAlertProps) {
  if (!error) return null

  const message = error.message || 'An unexpected error occurred.'
  const details = error instanceof ApiError && error.details?.length ? error.details : null

  return (
    <Alert variant="danger" dismissible={!!onDismiss} onClose={onDismiss}>
      <Alert.Heading className="fs-6 mb-1">
        {error instanceof ApiError ? `Error (${error.code})` : 'Error'}
      </Alert.Heading>
      <p className="mb-0">{message}</p>
      {details && (
        <ul className="mb-0 mt-1 ps-3">
          {(details as { message?: string }[]).map((d, i) => (
            <li key={i} className="small">
              {d.message ?? String(d)}
            </li>
          ))}
        </ul>
      )}
    </Alert>
  )
}
