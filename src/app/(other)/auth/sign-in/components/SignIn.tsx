'use client'
import { useSearchParams } from 'next/navigation'
import LoginFrom from './LoginFrom'

const FEATURES = [
  { icon: '🐾', label: 'Vaccination Campaign Management' },
  { icon: '🫂', label: 'Community Care Partner Network' },
  { icon: '📋', label: 'Digital Certificates & QR Verification' },
  { icon: '📊', label: 'Real-time Analytics & Reporting' },
]

const BpaLogomark = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="22" fill="#1a6e38" />
    <circle cx="22" cy="22" r="16" fill="rgba(255,255,255,0.08)" />
    <text x="22" y="28" textAnchor="middle" fill="white" fontSize="12" fontFamily="Arial,sans-serif" fontWeight="800">BPA</text>
  </svg>
)

const SignIn = () => {
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get('reason') === 'session_expired'
  // next-auth redirects here with `?error=<code>` when an OAuth sign-in
  // fails (bad/expired code, PKCE/state mismatch, wrong audience, denied
  // consent, etc.) — the code is a generic next-auth error identifier, never
  // the backend's own error text, so nothing sensitive is ever surfaced here.
  const ssoError = searchParams.get('error')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left – Form panel ───────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: 480,
        padding: '2.5rem 2rem',
        background: '#fff',
        boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
        zIndex: 1,
        flexShrink: 0,
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <BpaLogomark size={44} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a3c4d', lineHeight: 1.25 }}>
                Bangladesh Pet Association
              </div>
              <div style={{ fontSize: 11, color: '#6c757d', marginTop: 1 }}>Admin Dashboard</div>
            </div>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0d1b2a', marginBottom: 6 }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
            Sign in to manage BPA campaigns, members, and community programs.
          </p>

          {sessionExpired && (
            <div
              role="alert"
              style={{
                background: '#fff7ed',
                border: '1px solid #fdba74',
                color: '#9a3412',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Your session expired. Please sign in again.
            </div>
          )}

          {ssoError && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Sign-in was unsuccessful. Please try again, or sign in with your email and password below.
            </div>
          )}

          <LoginFrom />

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 32 }}>
            &copy; {new Date().getFullYear()} Bangladesh Pet Association
          </p>
        </div>
      </div>

      {/* ── Right – Brand panel (hidden on small screens) ─ */}
      <div
        className="d-none d-lg-flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          background: 'linear-gradient(150deg, #0b3621 0%, #1a6e38 55%, #2da058 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>

        {/* Decorative circles */}
        <span style={{
          position: 'absolute', top: -100, right: -100,
          width: 380, height: 380, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <span style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <span style={{
          position: 'absolute', top: '45%', right: '8%',
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />

        {/* Top BPA wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.12)" />
            <circle cx="28" cy="28" r="22" fill="rgba(255,255,255,0.08)" />
            <text x="28" y="35" textAnchor="middle" fill="white" fontSize="14" fontFamily="Arial,sans-serif" fontWeight="800">BPA</text>
          </svg>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
              Bangladesh Pet Association
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
              Serving pets and owners nationwide
            </div>
          </div>
        </div>

        {/* Centre: headline + features */}
        <div style={{ position: 'relative' }}>
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 600,
            letterSpacing: 2.5, textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            Administration Portal
          </div>
          <h1 style={{
            color: '#fff', fontSize: 42, fontWeight: 800,
            lineHeight: 1.15, marginBottom: 20, letterSpacing: -0.5,
          }}>
            Empowering<br />pet welfare<br />across Bangladesh
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.75, maxWidth: 400, marginBottom: 36 }}>
            Manage vaccination drives, issue digital certificates, track community care memberships, and monitor real-time campaign analytics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, fontWeight: 500 }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom caption */}
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, position: 'relative' }}>
          BPA Admin v2 &nbsp;·&nbsp; Community Care Edition
        </div>
      </div>

    </div>
  )
}

export default SignIn
