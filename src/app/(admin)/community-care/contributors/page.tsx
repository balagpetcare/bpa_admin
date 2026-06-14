import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ContributorListContent from './components/ContributorListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contributors' }

export default function ContributorsPage() {
  return (
    <>
      <PageTItle title="Contributors" />
      <ContributorListContent />
    </>
  )
}
