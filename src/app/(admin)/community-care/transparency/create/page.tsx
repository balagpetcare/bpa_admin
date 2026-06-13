import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import TransparencyForm from '../components/TransparencyForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Transparency Report' }

export default function TransparencyCreatePage() {
  return (
    <>
      <PageTItle title="New Transparency Report" />
      <TransparencyForm />
    </>
  )
}
