import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import ClinicImportContent from './components/ClinicImportContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Import Clinic Directory' }

export default function ClinicImportPage() {
  return (
    <>
      <PageTItle title="Import Clinic Directory" />
      <ClinicImportContent />
    </>
  )
}
