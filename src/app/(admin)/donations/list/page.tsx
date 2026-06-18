import type { Metadata } from 'next'
import DonationListContent from './components/DonationListContent'

export const metadata: Metadata = { title: 'All Donations | BPA Admin' }

export default function Page() {
  return <DonationListContent />
}
