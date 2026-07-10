'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'

// Returns helpers for checking the current user's permissions and roles.
export function usePermission() {
  const { data: session } = useSession()
  const roles: string[] = session?.user?.roles ?? []
  const [fetchedPermissions, setFetchedPermissions] = useState<string[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPermissions() {
      if (!session?.accessToken || roles.includes('super_admin')) {
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
  }, [roles, session?.accessToken])

  const permissions = useMemo(
    () => (session?.user as any)?.permissions ?? fetchedPermissions ?? [],
    [fetchedPermissions, session?.user],
  )

  // Check a single permission string like "news:publish"
  const can = (permission: string): boolean => {
    if (roles.includes('super_admin')) return true
    const resource = permission.split(':')[0]
    return permissions.includes(permission) || permissions.includes(`${resource}:manage`)
  }

  // Check if the user has any of the specified permissions
  const canAny = (...perms: string[]): boolean => perms.some(can)

  // Check if the user has all of the specified permissions
  const canAll = (...perms: string[]): boolean => perms.every(can)

  const hasRole = (role: string): boolean => roles.includes(role)

  const isSuperAdmin = roles.includes('super_admin')

  return { can, canAny, canAll, hasRole, isSuperAdmin, permissions, roles }
}
