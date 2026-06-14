import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SocialImpactProgramEditContent from '../components/SocialImpactProgramEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Social Impact Program' }

type PageProps = { params: Promise<{ id: string }> }

export default async function SocialImpactProgramEditPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Social Impact Program" />
      <SocialImpactProgramEditContent id={id} />
    </>
  )
}
