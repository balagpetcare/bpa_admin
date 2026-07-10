import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Banners & Sliders" />
      <AppControlManager
        resource="banners"
        title="Banners & Sliders"
        description="Manage hero banners, sliders, visibility windows, and CTA behavior for the app home experience."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Banners & Sliders' }]}
        icon="solar:slider-horizontal-bold-duotone"
        emptyTitle="No banners configured"
        emptyDescription="Create the first banner or slider record to populate the app home carousel."
      />
    </>
  )
}
