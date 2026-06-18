import type { Metadata } from 'next'
import ImpactStoryForm from '../components/ImpactStoryForm'

export const metadata: Metadata = { title: 'New Impact Story | BPA Admin' }

export default function Page() {
  return <ImpactStoryForm />
}
