import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import AnalyticsOverview from './components/AnalyticsOverview'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Analytics' }

export default function AnalyticsPage() {
  return (
    <>
      <PageTItle title="Analytics" />
      <AnalyticsOverview />
    </>
  )
}
