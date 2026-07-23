'use client'

interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
}

// Wraps any content with a semi-transparent overlay + spinner during async operations.
export default function LoadingOverlay({ loading, children }: LoadingOverlayProps) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 'inherit',
          }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}
