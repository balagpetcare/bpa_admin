'use client'

import { useEffect, useState } from 'react'

interface Props {
  value: string
  size?: number
  className?: string
}

/**
 * Renders a QR code data URL using the `qrcode` package (dynamically imported to avoid SSR issues).
 * Safe to use in Bootstrap 5 admin client components.
 */
export default function QrCodeImage({ value, size = 200, className }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('qrcode').then((mod) => {
      return mod.default.toDataURL(value, { width: size, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
    }).then((url) => {
      if (!cancelled) setDataUrl(url)
    }).catch(() => {
      if (!cancelled) setError(true)
    })
    return () => { cancelled = true }
  }, [value, size])

  if (error) return <p className="text-danger small">QR generation failed</p>
  if (!dataUrl) return <div className="spinner-border spinner-border-sm text-secondary" role="status" />

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      className={className}
    />
  )
}
