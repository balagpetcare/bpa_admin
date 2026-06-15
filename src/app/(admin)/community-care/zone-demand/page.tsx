import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ZoneDemandContent from './components/ZoneDemandContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Zone Demand & Clinic Priority' }

export default function ZoneDemandPage() {
  return (
    <>
      <PageTItle title="Zone Demand & Clinic Priority" />
      <ZoneDemandContent />
    </>
  )
}
