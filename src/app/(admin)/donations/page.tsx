import type { Metadata } from 'next'
import DonationDashboard from './components/DonationDashboard'

export const metadata: Metadata = { title: 'Donation Dashboard | BPA Admin' }

export default function Page() {
  return <DonationDashboard />
}
