import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Popup / Notice" />
      <AppControlManager
        resource="popup-notices"
        title="Popup / Notice"
        description="Create announcement popups and user-facing notices with CTA behavior, audience targeting, and publishing controls."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Popup / Notice' }]}
        icon="solar:window-frame-bold-duotone"
        emptyTitle="No popup notices configured"
        emptyDescription="Add popup notices when you need app-wide messaging or interruption-based alerts."
      />
    </>
  )
}
