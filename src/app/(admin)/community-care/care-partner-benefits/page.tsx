import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CarePartnerBenefitListContent from './components/CarePartnerBenefitListContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Care Partner Benefits' }

export default function CarePartnerBenefitsPage() {
  return (
    <>
      <PageTItle title="Care Partner Benefits" />
      <CarePartnerBenefitListContent />
    </>
  )
}
