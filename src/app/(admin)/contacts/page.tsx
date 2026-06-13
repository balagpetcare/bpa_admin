import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ContactsContent from './components/ContactsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contact Management' }

export default function ContactsPage() {
  return (
    <>
      <PageTItle title="Contact Messages" />
      <ContactsContent />
    </>
  )
}
