import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import SeoContent from './components/SeoContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'SEO Management' }

export default function SeoPage() {
  return (
    <>
      <PageTItle title="SEO Management" />
      <SeoContent />
    </>
  )
}
