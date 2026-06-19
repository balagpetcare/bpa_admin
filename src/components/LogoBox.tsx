'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getApiBase } from '@/lib/utils/api-url'

// Inline SVG — shown in collapsed sidebar and as fallback
const BpaMarkSvg = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-label="BPA">
    <circle cx="14" cy="14" r="14" fill="#1a6e38" />
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="8.5" fontFamily="Arial,sans-serif" fontWeight="700">BPA</text>
  </svg>
)

// Text logo for expanded sidebar (dark background variant)
const BpaTextLogoLight = () => (
  <div className="d-flex align-items-center gap-2">
    <BpaMarkSvg />
    <span className="logo-lg fw-bold" style={{ fontSize: 13, color: '#ffffff', lineHeight: 1.1 }}>
      BPA Admin
    </span>
  </div>
)

// Text logo for expanded sidebar (light background variant)
const BpaTextLogoDark = () => (
  <div className="d-flex align-items-center gap-2">
    <BpaMarkSvg />
    <span className="logo-lg fw-bold" style={{ fontSize: 13, color: '#1a3c4d', lineHeight: 1.1 }}>
      BPA Admin
    </span>
  </div>
)

const LogoBox = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${getApiBase()}/public/site-settings`)
      .then(r => r.json())
      .then((json: { data?: { secondaryLogoUrl?: string | null; primaryLogoUrl?: string | null } }) => {
        const url = json?.data?.secondaryLogoUrl ?? json?.data?.primaryLogoUrl ?? null
        setLogoUrl(url)
      })
      .catch(() => {})
  }, [])

  const smLogo = <BpaMarkSvg />

  const expandedLogo = logoUrl
    ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="BPA" style={{ height: 28, width: 'auto', objectFit: 'contain', maxWidth: 160 }} />
    )
    : null

  return (
    <div className="logo-box">
      {/* Dark mode (light sidebar): show dark-text logo */}
      <Link href="/" className="logo-dark">
        <span className="logo-sm">{smLogo}</span>
        <span className="logo-lg">{expandedLogo ?? <BpaTextLogoDark />}</span>
      </Link>
      {/* Light mode (dark sidebar): show white-text logo */}
      <Link href="/" className="logo-light">
        <span className="logo-sm">{smLogo}</span>
        <span className="logo-lg">{expandedLogo ?? <BpaTextLogoLight />}</span>
      </Link>
    </div>
  )
}

export default LogoBox
