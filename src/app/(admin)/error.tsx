'use client'

import { useEffect } from 'react'
import { Card, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin layout error:', error)
  }, [error])

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Card className="text-center p-4 border-danger border-opacity-25 shadow-sm" style={{ maxWidth: '400px' }}>
        <div className="mb-3 text-danger">
          <Icon icon="solar:danger-triangle-bold-duotone" width="48" height="48" />
        </div>
        <h4 className="mb-2">Something went wrong</h4>
        <p className="text-muted small mb-4">
          An unexpected error occurred in the admin interface.
        </p>
        <Button variant="primary" onClick={() => reset()}>
          <Icon icon="solar:refresh-circle-bold" className="me-2" />
          Try Again
        </Button>
      </Card>
    </div>
  )
}
