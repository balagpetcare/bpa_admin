import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SocialImpactProgramListContent from './components/SocialImpactProgramListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Social Impact Programs' }

export default function SocialImpactProgramsPage() {
  return (
    <>
      <PageTItle title="Social Impact Programs" />
      <SocialImpactProgramListContent />
    </>
  )
}
