import type { Metadata } from 'next'
import PurposeForm from '../components/PurposeForm'

export const metadata: Metadata = { title: 'New Purpose | BPA Admin' }

export default function Page() {
  return <PurposeForm />
}
