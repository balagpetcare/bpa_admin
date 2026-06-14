import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import CampaignForm from '../components/CampaignForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Campaign' }

export default function CampaignCreatePage() {
  return (
    <>
      <PageTItle title="New Campaign" />
      <CampaignForm />
    </>
  )
}
