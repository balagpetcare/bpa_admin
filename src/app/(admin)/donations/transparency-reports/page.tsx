import type { Metadata } from 'next'
import TransparencyReportsContent from './components/TransparencyReportsContent'

export const metadata: Metadata = { title: 'Transparency Reports | BPA Admin' }

export default function Page() {
  return <TransparencyReportsContent />
}
