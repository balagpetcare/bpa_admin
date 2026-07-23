import PageTItle from '@/components/PageTItle'
import PlaceholderModulePage from '../components/PlaceholderModulePage'
export default function Page() {
  return (
    <>
      <PageTItle title="Audit Logs" />
      <PlaceholderModulePage
        title="Audit Logs"
        description="Review module activity, changes, and admin actions once backend logging is connected."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Audit Logs' }]}
      />
    </>
  )
}
