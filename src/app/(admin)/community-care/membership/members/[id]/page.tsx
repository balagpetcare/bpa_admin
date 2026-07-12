import MembershipMemberDetailContent from '../../components/MembershipMemberDetailContent'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MembershipMemberDetailContent membershipId={id} />
}
