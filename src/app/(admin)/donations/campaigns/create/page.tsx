import type { Metadata } from 'next'
import DonationCampaignForm from '../components/DonationCampaignForm'

export const metadata: Metadata = { title: 'New Campaign | BPA Admin' }

export default function Page() {
  return <DonationCampaignForm />
}
