import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import TransparencyEditContent from '../components/TransparencyEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Transparency Report' }

export default function TransparencyEditPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Edit Transparency Report" />
      <TransparencyEditContent id={params.id} />
    </>
  )
}
