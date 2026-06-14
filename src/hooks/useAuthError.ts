'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Watches session.error globally. When RefreshTokenExpired is detected,
// signs the user out and redirects to the lock screen.
export function useAuthError() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.error === 'RefreshTokenExpired') {
      signOut({ redirect: false }).then(() => {
        router.push('/auth/lock-screen?reason=session_expired')
      })
    }
  }, [session?.error, router])
}
