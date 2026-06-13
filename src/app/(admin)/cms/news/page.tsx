import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import NewsListContent from './components/NewsListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'News CMS' }

export default function NewsPage() {
  return (
    <>
      <PageTItle title="News CMS" />
      <NewsListContent />
    </>
  )
}
