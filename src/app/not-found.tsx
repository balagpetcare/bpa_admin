'use client'
import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center p-4">
      <div className="mb-4">
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-label="BPA">
          <circle cx="24" cy="24" r="24" fill="#1a6e38" />
          <text x="24" y="31" textAnchor="middle" fill="white" fontSize="14" fontFamily="Arial,sans-serif" fontWeight="700">BPA</text>
        </svg>
      </div>
      <h1 className="display-1 fw-bold text-muted">404</h1>
      <h2 className="fw-bold mb-3">Page Not Found</h2>
      <p className="text-muted mb-4">
        Sorry, the page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFound
