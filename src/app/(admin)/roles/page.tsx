import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import RolesPageContent from './components/RolesPageContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Roles & Permissions' }

export default function RolesPage() {
  return (
    <>
      <PageTItle title="Roles & Permissions" />
      <RolesPageContent />
    </>
  )
}
