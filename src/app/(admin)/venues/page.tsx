import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageTItle from '@/components/PageTItle'
import VenuesContent from './components/VenuesContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Venues' }

export default function VenuesPage() {
  return (
    <>
      <PageTItle title="Venues" />
      <Suspense>
        <VenuesContent />
      </Suspense>
    </>
  )
}
