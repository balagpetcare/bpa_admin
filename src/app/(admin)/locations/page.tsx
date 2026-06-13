import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import LocationsContent from './components/LocationsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Locations' }

export default function LocationsPage() {
  return (
    <>
      <PageTItle title="Locations" />
      <LocationsContent />
    </>
  )
}
