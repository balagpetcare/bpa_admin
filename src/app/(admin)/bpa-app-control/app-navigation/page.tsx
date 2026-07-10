import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="App Navigation" />
      <AppControlManager
        resource="navigation-items"
        title="App Navigation"
        description="Configure app navigation entries, route targets, and ordering for internal app menus and shortcut structures."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'App Navigation' }]}
        icon="solar:compass-bold-duotone"
        emptyTitle="No navigation items configured"
        emptyDescription="Add navigation items to control how the app routes and shortcuts are presented."
      />
    </>
  )
}
