import type { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import VaccinationMonitor from './components/VaccinationMonitor'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Vaccination Records' }

export default async function CampaignVaccinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <PageTItle title="Vaccination Records" />
      <VaccinationMonitor campaignId={id} />
    </>
  )
}
