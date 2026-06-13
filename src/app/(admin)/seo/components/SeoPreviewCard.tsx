'use client'

interface SeoPreviewCardProps {
  route: string
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string | null
}

const BASE_URL = 'https://bpa.org.bd'

export default function SeoPreviewCard({ route, title, description, ogTitle, ogDescription, ogImageUrl }: SeoPreviewCardProps) {
  const displayTitle = title || '(No title set)'
  const displayDesc = description || '(No description set)'
  const displayUrl = `${BASE_URL}${route}`

  return (
    <div className="border rounded overflow-hidden" style={{ maxWidth: 600, fontFamily: 'Arial, sans-serif' }}>
      {ogImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ogImageUrl} alt="OG preview" className="w-100" style={{ maxHeight: 200, objectFit: 'cover' }} />
      )}
      <div className="p-3">
        <div className="text-muted small mb-1" style={{ fontSize: 13 }}>{displayUrl}</div>
        <div className="fw-semibold text-primary" style={{ fontSize: 18, lineHeight: 1.3 }}>
          {ogTitle || displayTitle}
        </div>
        <div className="text-muted mt-1" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {ogDescription || displayDesc}
        </div>
      </div>
    </div>
  )
}
