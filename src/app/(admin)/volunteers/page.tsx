import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import VolunteersContent from './components/VolunteersContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Volunteer Management' }

export default function VolunteersPage() {
  return (
    <>
      <PageTItle title="Volunteer Management" />
      <VolunteersContent />
    </>
  )
}
