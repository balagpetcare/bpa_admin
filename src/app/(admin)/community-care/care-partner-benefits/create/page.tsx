import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CarePartnerBenefitForm from '../components/CarePartnerBenefitForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Care Partner Benefit' }

export default function CarePartnerBenefitCreatePage() {
  return (
    <>
      <PageTItle title="New Care Partner Benefit" />
      <CarePartnerBenefitForm />
    </>
  )
}
