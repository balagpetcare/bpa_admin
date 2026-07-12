import MembershipCampaignForm from '../../../components/MembershipCampaignForm'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MembershipCampaignForm campaignId={id} />
}
