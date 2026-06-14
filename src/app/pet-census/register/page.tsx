import type { Metadata } from 'next'
import PetCensusRegisterForm from '../components/PetCensusRegisterForm'

export const metadata: Metadata = {
  title: 'Register For Pet Census 2026',
  description: 'Submit your pet census information to Bangladesh Pet Association.',
}

export default function PetCensusRegisterPage() {
  return <PetCensusRegisterForm />
}
