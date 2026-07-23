'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'

// bpa_api's own authorize() middleware (src/middlewares/authorize.ts) bypasses
// all permission checks for any of these three role strings — 'super_admin'
// is this app's local convention, 'SUPER_ADMIN'/'GLOBAL_SUPER_ADMIN' are what
// Central Auth actually issues for its highest-privilege principals. Before
// this fix, usePermission only recognized the lowercase form, so a real
// Central-Auth super admin got `can(...) === false` for every action even
// though the backend would have allowed it — the entire edit UI rendered as
// permanently disabled/read-only with no indication why.
export const SUPER_ADMIN_ROLES = ['super_admin', 'SUPER_ADMIN', 'GLOBAL_SUPER_ADMIN']

// Exported standalone so it's unit-testable without rendering the hook
// (this repo has no React component test renderer).
export function isSuperAdminRole(roles: string[]): boolean {
  return roles.some((r) => SUPER_ADMIN_ROLES.includes(r))
}

// Returns helpers for checking the current user's permissions and roles.
export function usePermission() {
  const { data: session } = useSession()
  const roles: string[] = session?.user?.roles ?? []
  const isSuperAdmin = isSuperAdminRole(roles)
  const [fetchedPermissions, setFetchedPermissions] = useState<string[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPermissions() {
      if (!session || isSuperAdmin) {
        setFetchedPermissions([])
        return
      }

      try {
        const me = await api.get<{ permissions?: string[] }>('/auth/me')
        if (!cancelled) {
          setFetchedPermissions(me.permissions ?? [])
        }
      } catch {
        if (!cancelled) {
          setFetchedPermissions([])
        }
      }
    }

    loadPermissions()

    return () => {
      cancelled = true
    }
  }, [isSuperAdmin, session])

  const permissions = useMemo(() => (session?.user as any)?.permissions ?? fetchedPermissions ?? [], [fetchedPermissions, session?.user])

  // Check a single permission string like "news:publish"
  const can = (permission: string): boolean => {
    if (isSuperAdmin) return true
    const resource = permission.split(':')[0]
    return permissions.includes(permission) || permissions.includes(`${resource}:manage`)
  }

  // Check if the user has any of the specified permissions
  const canAny = (...perms: string[]): boolean => perms.some(can)

  // Check if the user has all of the specified permissions
  const canAll = (...perms: string[]): boolean => perms.every(can)

  const hasRole = (role: string): boolean => roles.includes(role)

  return { can, canAny, canAll, hasRole, isSuperAdmin, permissions, roles }
}
