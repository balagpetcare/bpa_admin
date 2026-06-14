import type { Metadata } from 'next'
import PetCensusThankYouContent from '../components/PetCensusThankYouContent'

export const metadata: Metadata = {
  title: 'Pet Census Thank You',
  description: 'Thank you for submitting your pet census information.',
}

export default function PetCensusThankYouPage() {
  return <PetCensusThankYouContent />
}
