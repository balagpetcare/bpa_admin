import { redirect } from 'next/navigation'

export default async function MembershipCampaignDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/community-care/membership/campaigns/${id}/edit`)
}
