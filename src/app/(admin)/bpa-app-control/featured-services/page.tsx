import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Featured Services" />
      <AppControlManager
        resource="featured-services"
        title="Featured Services"
        description="Highlight services, programs, and utility modules that should receive priority placement in the mobile app."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Featured Services' }]}
        icon="solar:star-bold-duotone"
        emptyTitle="No featured services configured"
        emptyDescription="Create featured service records to surface high-priority actions in the app."
      />
    </>
  )
}
