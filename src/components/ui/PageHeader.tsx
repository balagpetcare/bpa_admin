'use client'

import { ReactNode } from 'react'
import { Row, Col } from 'react-bootstrap'
import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

function hasBreadcrumbHref(item: BreadcrumbItem): item is BreadcrumbItem & { href: string } {
  return typeof item.href === 'string' && item.href.trim().length > 0
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  action?: ReactNode
}

// Page header with breadcrumb trail and optional action button slot.
export default function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  const breadcrumbItems = breadcrumbs ?? []

  return (
    <Row className="align-items-center mb-3">
      <Col>
        <h4 className="mb-1">{title}</h4>
        {breadcrumbItems.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 py-0">
              <li className="breadcrumb-item">
                <Link href="/dashboard" className="text-decoration-none">
                  Home
                </Link>
              </li>

              {breadcrumbItems.map((item, idx) => {
                const isLastItem = idx === breadcrumbItems.length - 1
                const canRenderLink = hasBreadcrumbHref(item) && !isLastItem

                if (!canRenderLink) {
                  return (
                    <li key={item.label} className="breadcrumb-item active" aria-current="page">
                      {item.label}
                    </li>
                  )
                }

                return (
                  <li key={item.label} className="breadcrumb-item">
                    <Link href={item.href} className="text-decoration-none">
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
      </Col>
      {action && <Col xs="auto">{action}</Col>}
    </Row>
  )
}
