'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Nav } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'

const TABS = [
  { href: '/bpa-app-control/push-notifications/dashboard', label: 'Dashboard' },
  { href: '/bpa-app-control/push-notifications/compose', label: 'Compose' },
  { href: '/bpa-app-control/push-notifications/scheduled', label: 'Scheduled' },
  { href: '/bpa-app-control/push-notifications/automated-rules', label: 'Automated Rules' },
  { href: '/bpa-app-control/push-notifications/templates', label: 'Templates' },
  { href: '/bpa-app-control/push-notifications/audience-segments', label: 'Audience Segments' },
  { href: '/bpa-app-control/push-notifications/delivery-reports', label: 'Delivery Reports' },
  { href: '/bpa-app-control/push-notifications/failed-deliveries', label: 'Failed Deliveries' },
  { href: '/bpa-app-control/push-notifications/settings', label: 'Settings' },
]

export default function PushNotificationsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <PageTItle title="Push Notifications" />
      <Nav variant="tabs" className="mb-3 flex-nowrap overflow-auto push-notif-tabs">
        {TABS.map((tab) => (
          <Nav.Item key={tab.href} className="text-nowrap">
            <Nav.Link as={Link} href={tab.href} active={pathname === tab.href || pathname.startsWith(tab.href + '/')}>
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      {children}
    </div>
  )
}
