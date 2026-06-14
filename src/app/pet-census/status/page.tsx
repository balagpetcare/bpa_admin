import type { Metadata } from 'next'
import PetCensusStatusLookupContent from '../components/PetCensusStatusLookupContent'

export const metadata: Metadata = {
  title: 'Pet Census Status',
  description: 'Check the status of your Bangladesh Pet Association pet census submission.',
}

export default function PetCensusStatusPage() {
  return <PetCensusStatusLookupContent />
}
