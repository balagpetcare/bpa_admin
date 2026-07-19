import { redirect } from 'next/navigation'

// This route has no campaignId in its URL, but MembershipPlansContent requires
// one (plans are scoped to a campaign). Send users to the campaign list so
// they can pick a campaign and land on the properly-scoped
// /community-care/membership/campaigns/[id]/plans route instead.
export default function Page() {
  redirect('/community-care/membership/campaigns')
}
