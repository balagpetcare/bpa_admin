import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import NewsForm from '../components/NewsForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Create Article' }

export default function NewsCreatePage() {
  return (
    <>
      <PageTItle title="New Article" />
      <NewsForm />
    </>
  )
}
