import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CertificatesManager from './components/CertificatesManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campaign Certificates' }

export default async function CampaignCertificatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Certificates" />
      <CertificatesManager campaignId={id} />
    </>
  )
}
