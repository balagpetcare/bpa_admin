'use client'

import { useEffect } from 'react'

/**
 * Warns before the browser tab closes/refreshes while a form has unsaved
 * changes. Next.js App Router has no public API to intercept in-app
 * client-side navigation, so callers should also confirm explicitly before
 * programmatic navigation (e.g. a "Back" button) — see `confirmDialog`.
 */
export function useUnsavedChangesWarning(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
