import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper'
import type { Metadata } from 'next'
import { Play } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import '@/assets/scss/app.scss'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'

const play = Play({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | BPA Admin',
    default: DEFAULT_PAGE_TITLE,
  },
  description: 'Bangladesh Pet Association — Admin Dashboard',
}

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: all 15s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.7s forwards;
  z-index: 0;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`

// Inline BPA splash mark — no external image dependency
const BpaSplashLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#1a6e38" />
      <text x="24" y="32" textAnchor="middle" fill="white" fontSize="15" fontFamily="Arial,sans-serif" fontWeight="700">BPA</text>
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
      <span style={{ fontWeight: 700, fontSize: 18, color: '#1a3c4d' }}>Bangladesh Pet</span>
      <span style={{ fontWeight: 700, fontSize: 18, color: '#1a6e38' }}>Association</span>
    </div>
  </div>
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style suppressHydrationWarning>{splashScreenStyles}</style>
      </head>
      <body className={play.className}>
        <div id="splash-screen">
          <BpaSplashLogo />
        </div>
        <NextTopLoader color="#1a6e38" showSpinner={false} />
        <div id="__next_splash">
          <AppProvidersWrapper>{children}</AppProvidersWrapper>
        </div>
      </body>
    </html>
  )
}
