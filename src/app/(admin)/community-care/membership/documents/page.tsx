'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Badge, Spinner } from 'react-bootstrap'
import Link from 'next/link'
import { communityMembershipApi } from '@/lib/api/community-membership.api'
import PageHeader from '@/components/ui/PageHeader'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.listDocuments()
      setDocs(res ?? [])
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    await communityMembershipApi.deleteDocument(id)
    fetch()
  }

  const docTypeLabel = (t: string) => {
    const labels: Record<string, string> = {
      terms_and_conditions: 'Terms & Conditions',
      refund_policy: 'Refund Policy',
      service_availability_policy: 'Service Availability',
      discount_policy: 'Discount Policy',
      welcome_letter: 'Welcome Letter',
    }
    return labels[t] || t
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <PageHeader
        title="PDF Documents"
        action={
          <Button as={Link as any} href="/community-care/membership/documents/create" variant="success">
            + New Document
          </Button>
        }
      />
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title (EN)</th>
                <th>Title (BN)</th>
                <th>Version</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d: any) => (
                <tr key={d.id}>
                  <td>
                    <Badge bg="info">{docTypeLabel(d.documentType)}</Badge>
                  </td>
                  <td>{d.titleEn}</td>
                  <td>{d.titleBn}</td>
                  <td>v{d.version}</td>
                  <td>
                    <Badge bg={d.isActive ? 'success' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>
                    <Button as={Link as any} href={`/community-care/membership/documents/${d.id}/edit`} size="sm" variant="info" className="me-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  )
}
