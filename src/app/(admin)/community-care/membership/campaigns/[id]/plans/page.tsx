import MembershipPlansContent from '../../../components/MembershipPlansContent'

export default async function MembershipCampaignPlansPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <MembershipPlansContent campaignId={id} />
}
