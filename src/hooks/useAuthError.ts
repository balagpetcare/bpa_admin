'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Watches session.error globally. When RefreshTokenExpired is detected,
// signs the user out and redirects to the real sign-in page. Previously this
// redirected to /auth/lock-screen, an unfixed Larkon template demo page with
// a non-functional form (empty onSubmit handler) and unrelated branding —
// a dead end with no way back into the app. /auth/sign-in is the same page
// middleware.ts already redirects to for unauthenticated requests, so there
// is one consistent re-auth destination app-wide.
export function useAuthError() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.error === 'RefreshTokenExpired') {
      signOut({ redirect: false }).then(() => {
        router.push('/auth/sign-in?reason=session_expired&redirectTo=/dashboard')
      })
    }
  }, [session?.error, router])
}
