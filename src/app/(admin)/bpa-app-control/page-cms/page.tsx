import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Page CMS" />
      <AppControlManager
        resource="page-contents"
        title="Page CMS"
        description="Manage structured in-app pages, route-bound content, and reusable app page copy through the admin panel."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Page CMS' }]}
        icon="solar:document-text-bold-duotone"
        emptyTitle="No page content configured"
        emptyDescription="Create page content records to power app CMS-managed screens."
      />
    </>
  )
}
