import type { Metadata } from 'next'
import DonationCampaignList from './components/DonationCampaignList'

export const metadata: Metadata = { title: 'Donation Campaigns | BPA Admin' }

export default function Page() {
  return <DonationCampaignList />
}
