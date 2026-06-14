import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import DashboardContent from './components/DashboardContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <>
      <PageTItle title="Dashboard" />
      <DashboardContent />
    </>
  )
}
