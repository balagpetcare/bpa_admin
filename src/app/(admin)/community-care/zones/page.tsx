import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ZoneListContent from './components/ZoneListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Community Zones' }

export default function ZonesPage() {
  return (
    <>
      <PageTItle title="Community Zones" />
      <ZoneListContent />
    </>
  )
}
