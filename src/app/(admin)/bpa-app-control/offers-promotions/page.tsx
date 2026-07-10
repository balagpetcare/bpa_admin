import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Offers & Promotions" />
      <AppControlManager
        resource="offers"
        title="Offers & Promotions"
        description="Create promotional offers, limited-time placements, and messaging campaigns tied to app audiences and schedules."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Offers & Promotions' }]}
        icon="solar:ticket-bold-duotone"
        emptyTitle="No offers configured"
        emptyDescription="Add offers or promotions when you want targeted promotional messaging in the app."
      />
    </>
  )
}
