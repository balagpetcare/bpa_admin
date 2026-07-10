import PageTItle from '@/components/PageTItle'
import AppControlManager from '../components/AppControlManager'

export default function Page() {
  return (
    <>
      <PageTItle title="Campaign Blocks" />
      <AppControlManager
        resource="home-sections"
        title="Campaign Blocks"
        description="Manage campaign-focused blocks and promotional home sections that direct users into active BPA programs."
        breadcrumbs={[{ label: 'BPA App Control' }, { label: 'Campaign Blocks' }]}
        icon="solar:bookmark-square-minimalistic-bold-duotone"
        emptyTitle="No campaign blocks configured"
        emptyDescription="Create campaign content blocks to promote active programs in the app home feed."
      />
    </>
  )
}
