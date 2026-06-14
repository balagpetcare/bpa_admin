import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import TransparencyAllocationContent from './components/TransparencyAllocationContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Transparency Allocation Settings' }

export default function TransparencyAllocationPage() {
  return (
    <>
      <PageTItle title="Transparency Allocation Settings" />
      <TransparencyAllocationContent />
    </>
  )
}
