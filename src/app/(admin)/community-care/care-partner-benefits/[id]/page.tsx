import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CarePartnerBenefitEditContent from '../components/CarePartnerBenefitEditContent'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Care Partner Benefit' }

type PageProps = { params: Promise<{ id: string }> }

export default async function CarePartnerBenefitEditPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Edit Care Partner Benefit" />
      <CarePartnerBenefitEditContent id={id} />
    </>
  )
}
