import type { Metadata } from 'next'
import QrCodesContent from './components/QrCodesContent'

export const metadata: Metadata = { title: 'Donation QR Codes | BPA Admin' }

export default function Page() {
  return <QrCodesContent />
}
