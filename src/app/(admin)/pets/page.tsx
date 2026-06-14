import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import PetsContent from './components/PetsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pets & Owners' }

export default function PetsPage() {
  return (
    <>
      <PageTItle title="Pets & Owners" />
      <PetsContent />
    </>
  )
}
