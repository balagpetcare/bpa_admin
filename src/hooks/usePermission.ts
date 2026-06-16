'use client'

import { useSession } from 'next-auth/react'

// Returns helpers for checking the current user's permissions and roles.
//
// NOTE: The permissions array is NOT stored in the NextAuth session cookie.
// Storing it caused cookie overflow (> 4096 bytes) → Nginx 502 on login.
// Access control here is role-based: super_admin passes all can() checks.
// If you need granular permission checks for non-super-admin users, fetch
// them from GET /auth/me using session.accessToken and cache the result.
export function usePermission() {
  const { data: session } = useSession()

  const roles: string[] = session?.user?.roles ?? []

  // super_admin bypasses all permission checks.
  // Other roles always return false for can() since permissions aren't in session.
  const can = (permission: string): boolean => {
    if (roles.includes('super_admin')) return true
    // Permissions not in session — see note above.
    void permission
    return false
  }

  const canAny = (...perms: string[]): boolean => perms.some(can)
  const canAll = (...perms: string[]): boolean => perms.every(can)
  const hasRole = (role: string): boolean => roles.includes(role)
  const isSuperAdmin = roles.includes('super_admin')

  return { can, canAny, canAll, hasRole, isSuperAdmin, permissions: [] as string[], roles }
}
