import type { Metadata } from 'next'
import DonationCmsContent from './components/DonationCmsContent'

export const metadata: Metadata = { title: 'Donation Page CMS | BPA Admin' }

export default function Page() {
  return <DonationCmsContent />
}
