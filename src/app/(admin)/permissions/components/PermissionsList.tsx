'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useEffect, useState } from 'react'
import { Card, CardTitle, Col, Row, Spinner } from 'react-bootstrap'

interface Permission {
  id: string
  resource: string
  action: string
  description?: string
}

const PermissionsList = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/proxy/permissions')
      .then((r) => r.json())
      .then((data) => {
        setPermissions(Array.isArray(data?.data) ? data.data : [])
      })
      .catch(() => setError('Failed to load permissions'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <div className="d-flex card-header justify-content-between align-items-center">
            <CardTitle as={'h4'} className="mb-0">All Permissions</CardTitle>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Resource</th>
                  <th>Action</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading permissions…
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-danger">
                      <IconifyIcon icon="solar:danger-triangle-bold-duotone" className="me-1" />
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && permissions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      No permissions found.
                    </td>
                  </tr>
                )}
                {permissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="badge bg-info-subtle text-info py-1 px-2 fs-11">{p.resource}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary py-1 px-2 fs-11">{p.action}</span>
                    </td>
                    <td className="text-muted">{p.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Col>
    </Row>
  )
}

export default PermissionsList
