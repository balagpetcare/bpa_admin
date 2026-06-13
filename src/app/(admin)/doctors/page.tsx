import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import DoctorsContent from './components/DoctorsContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Doctors' }

export default function DoctorsPage() {
  return (
    <>
      <PageTItle title="Doctors" />
      <DoctorsContent />
    </>
  )
}
