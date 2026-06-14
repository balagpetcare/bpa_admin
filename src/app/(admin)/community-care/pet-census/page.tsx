import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PetCensusListContent from './components/PetCensusListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pet Census' }

export default function PetCensusPage() {
  return (
    <>
      <PageTItle title="Pet Census" />
      <PetCensusListContent />
    </>
  )
}
