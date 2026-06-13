import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ZoneEditContent from '../components/ZoneEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Zone' }

export default function ZoneEditPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTItle title="Edit Zone" />
      <ZoneEditContent id={params.id} />
    </>
  )
}
