'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'

export default function MailSentRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to mailbox inbox filtering by sent_success
    router.replace('/mail/inbox')
  }, [router])

  return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="text-muted mt-2">Loading sent mail logs...</p>
    </div>
  )
}
