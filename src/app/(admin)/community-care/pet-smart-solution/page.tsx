import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PetSmartSolutionContent from './components/PetSmartSolutionContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pet Smart Solution' }

export default function PetSmartSolutionPage() {
  return (
    <>
      <PageTItle title="Pet Smart Solution" />
      <PetSmartSolutionContent />
    </>
  )
}
