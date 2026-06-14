import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CareFundDashboardContent from './components/CareFundDashboardContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Care Fund Dashboard' }

export default function CareFundDashboardPage() {
  return (
    <>
      <PageTItle title="Care Fund Dashboard" />
      <CareFundDashboardContent />
    </>
  )
}
