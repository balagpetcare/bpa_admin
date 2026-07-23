'use client'

import { Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { ContactStatus } from '@/types/bpa.types'

interface ContactReplyPanelProps {
  status: ContactStatus
  repliedAt: string | null
}

export default function ContactReplyPanel({ status, repliedAt }: ContactReplyPanelProps) {
  if (status === 'replied') {
    return (
      <Alert variant="success" className="mb-0 py-2">
        <Icon icon="solar:check-circle-bold" className="me-2" />
        <strong>Replied</strong>
        {repliedAt && <span className="text-muted ms-2 small">on {new Date(repliedAt).toLocaleDateString()}</span>}
      </Alert>
    )
  }

  if (status === 'read') {
    return (
      <Alert variant="info" className="mb-0 py-2">
        <Icon icon="solar:eye-bold" className="me-2" />
        <strong>Read</strong>
        <span className="text-muted ms-2 small">— mark as replied once you respond via email</span>
      </Alert>
    )
  }

  return (
    <Alert variant="warning" className="mb-0 py-2">
      <Icon icon="solar:bell-bold" className="me-2" />
      <strong>Unread</strong>
      <span className="text-muted ms-2 small">— mark as read or replied using the buttons below</span>
    </Alert>
  )
}
