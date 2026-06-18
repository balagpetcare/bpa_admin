import type { Metadata } from 'next'
import ImpactStoryList from './components/ImpactStoryList'

export const metadata: Metadata = { title: 'Impact Stories | BPA Admin' }

export default function Page() {
  return <ImpactStoryList />
}
