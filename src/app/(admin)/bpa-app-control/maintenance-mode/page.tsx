import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Maintenance Mode" />
      <AppControlManager
        resource="page-contents"
        title="Maintenance Mode"
        description="Manage maintenance-mode messaging and route-linked maintenance content using the current app content API surface."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Maintenance Mode' }]}
        icon="solar:shield-warning-bold-duotone"
        emptyTitle="No maintenance entries configured"
        emptyDescription="Create maintenance-mode records to define temporary app messaging and entry rules."
        createDefaults={{ destinationType: 'INTERNAL_PAGE', destinationValue: 'maintenance_mode' }}
        hideDestinationTypeFilter
        maintenanceModeOnly
      />
    </>
  )
}
