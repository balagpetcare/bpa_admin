import type { Metadata } from 'next'
import PurposeListContent from './components/PurposeListContent'

export const metadata: Metadata = { title: 'Donation Purposes | BPA Admin' }

export default function Page() {
  return <PurposeListContent />
}
