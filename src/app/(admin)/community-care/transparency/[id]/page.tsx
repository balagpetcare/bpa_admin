import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import TransparencyEditContent from '../components/TransparencyEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Transparency Report' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function TransparencyEditPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <PageTItle title="Edit Transparency Report" />
      <TransparencyEditContent id={id} />
    </>
  )
}
