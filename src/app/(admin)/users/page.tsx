import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import UsersPageContent from './components/UsersPageContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Users Management' }

export default function UsersPage() {
  return (
    <>
      <PageTItle title="Users Management" />
      <UsersPageContent />
    </>
  )
}
