import PageTItle from '@/components/PageTItle'
import PlaceholderModulePage from '../components/PlaceholderModulePage'

export default function Page() {
  return (
    <>
      <PageTItle title="App Dashboard" />
      <PlaceholderModulePage
        title="App Dashboard"
        description="Central command view for app health, content rollout, and engagement controls."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'App Dashboard' }]}
      />
    </>
  )
}
