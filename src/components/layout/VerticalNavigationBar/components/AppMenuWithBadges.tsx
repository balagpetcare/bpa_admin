'use client'

import { useEffect, useRef, useState } from 'react'
import AppMenu from './AppMenu'
import { getMenuItems } from '@/assets/data/menu-items'
import { contactInquiryApi } from '@/lib/api/contact-inquiry.api'
import { apiClientPaginated } from '@/lib/api'

const POLL_MS = 60_000

async function fetchBadgeCounts(): Promise<{ newInquiries: number; pendingVolunteers: number }> {
  const [inqRes, volRes] = await Promise.allSettled([
    contactInquiryApi.list({ status: 'new', limit: 1 }),
    apiClientPaginated('/volunteers', { method: 'GET', params: { status: 'pending', limit: 1 } }),
  ])
  return {
    newInquiries: inqRes.status === 'fulfilled' ? (inqRes.value.meta?.total ?? 0) : 0,
    pendingVolunteers: volRes.status === 'fulfilled' ? (volRes.value.meta?.total ?? 0) : 0,
  }
}

export default function AppMenuWithBadges() {
  const [counts, setCounts] = useState({ newInquiries: 0, pendingVolunteers: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchBadgeCounts()
      .then(setCounts)
      .catch(() => {})
    intervalRef.current = setInterval(
      () =>
        fetchBadgeCounts()
          .then(setCounts)
          .catch(() => {}),
      POLL_MS,
    )
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const menuItems = getMenuItems({
    newInquiries: counts.newInquiries || undefined,
    pendingVolunteers: counts.pendingVolunteers || undefined,
  })

  return <AppMenu menuItems={menuItems} />
}
