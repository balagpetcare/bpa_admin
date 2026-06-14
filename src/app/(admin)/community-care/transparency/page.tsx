import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import TransparencyListContent from './components/TransparencyListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Transparency Reports' }

export default function TransparencyPage() {
  return (
    <>
      <PageTItle title="Transparency Reports" />
      <TransparencyListContent />
    </>
  )
}
