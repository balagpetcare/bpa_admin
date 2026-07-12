import MembershipCampaignWizard from '../../../components/wizard/MembershipCampaignWizard'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MembershipCampaignWizard campaignId={id} />
}
