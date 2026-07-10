'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { BPA_APP_CONTROL_SECTIONS } from './module-config'
import clsx from 'clsx'

export default function InternalSidebar() {
  const pathname = usePathname()

  return (
    <Card className="border-0 shadow-sm h-100 bpa-app-control-nav">
      <Card.Header className="bg-transparent border-bottom py-3">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <Icon icon="solar:smartphone-2-bold-duotone" width="20" />
          </div>
          <div>
            <div className="fw-bold">BPA App Control</div>
            <div className="text-muted small">Mobile app management</div>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-2">
        {BPA_APP_CONTROL_SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            <div className="px-3 pt-2 pb-1 text-muted small text-uppercase fw-semibold" style={{ letterSpacing: '0.06em' }}>{section.title}</div>
            <div className="list-group list-group-flush">
              {section.items.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'list-group-item list-group-item-action border-0 rounded-3 mx-2 mb-1 d-flex align-items-center gap-2',
                      active ? 'bg-primary text-white' : 'bg-transparent text-secondary',
                    )}
                  >
                    <Icon icon={item.icon} width="18" />
                    <span className="small fw-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </Card.Body>
    </Card>
  )
}

