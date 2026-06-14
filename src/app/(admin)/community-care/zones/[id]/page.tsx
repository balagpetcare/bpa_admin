import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ZoneEditContent from '../components/ZoneEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Zone' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ZoneEditPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Edit Zone" />
      <ZoneEditContent id={id} />
    </>
  )
}
