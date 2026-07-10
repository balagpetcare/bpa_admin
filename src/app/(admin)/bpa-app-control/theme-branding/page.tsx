import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Theme & Branding" />
      <AppControlManager
        resource="theme-settings"
        kind="theme"
        title="Theme & Branding"
        description="Set app colors, logo, typography, search placeholder text, and the public mobile branding surface using the existing app control records."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Theme & Branding' }]}
        icon="solar:palette-bold-duotone"
        emptyTitle="No theme branding configured"
        emptyDescription="Create a published theme record to control mobile branding and colors."
      />
    </>
  )
}
