import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CommitteeContent from './components/CommitteeContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Committee CMS' }

export default function CommitteePage() {
  return (
    <>
      <PageTItle title="Committee CMS" />
      <CommitteeContent />
    </>
  )
}
