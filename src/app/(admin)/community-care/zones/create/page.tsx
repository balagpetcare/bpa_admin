import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ZoneForm from '../components/ZoneForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Zone' }

export default function ZoneCreatePage() {
  return (
    <>
      <PageTItle title="New Zone" />
      <ZoneForm />
    </>
  )
}
