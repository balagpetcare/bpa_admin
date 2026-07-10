import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Version Control" />
      <AppControlManager
        resource="version-settings"
        title="Version Control"
        description="Manage app release gating, minimum supported versions, latest version metadata, and force-update rules."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Version Control' }]}
        icon="solar:code-bold-duotone"
        emptyTitle="No version rules configured"
        emptyDescription="Create a version setting record to define upgrade expectations for the mobile app."
        kind="version"
      />
    </>
  )
}
