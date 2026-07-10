import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Quick Actions" />
      <AppControlManager
        resource="quick-actions"
        title="Quick Actions"
        description="Configure the shortcut actions users see on the app home screen, including CTA targets and schedules."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Quick Actions' }]}
        icon="solar:flash-bold-duotone"
        emptyTitle="No quick actions configured"
        emptyDescription="Add quick actions so users can jump to key app experiences."
      />
    </>
  )
}
