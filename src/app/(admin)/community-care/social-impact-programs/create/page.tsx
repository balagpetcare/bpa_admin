import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SocialImpactProgramForm from '../components/SocialImpactProgramForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Social Impact Program' }

export default function SocialImpactProgramCreatePage() {
  return (
    <>
      <PageTItle title="New Social Impact Program" />
      <SocialImpactProgramForm />
    </>
  )
}
