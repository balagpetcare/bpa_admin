'use client'

import { Card, Button, Row, Col, Table, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'

export default function MailSettingsPage() {
  return (
    <>
      <PageHeader title="Mail & Webmail Settings" breadcrumbs={[{ label: 'Mail' }, { label: 'Settings' }]} />

      <Row>
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-bottom py-3">
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:shield-check-bold" className="text-primary" /> Security & Storage Policies
              </h5>
            </Card.Header>
            <Card.Body>
              <Table bordered hover responsive size="sm" className="align-middle">
                <tbody>
                  <tr>
                    <td className="fw-semibold bg-light text-secondary" style={{ width: '40%' }}>Max Attachment Size</td>
                    <td>15 Megabytes (15MB)</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light text-secondary">Blocked File Extensions</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {['.exe', '.js', '.sh', '.bat', '.cmd', '.scr', '.msi', '.vbs', '.com'].map(ext => (
                          <Badge key={ext} bg="danger-subtle" className="text-danger border border-danger">
                            {ext}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light text-secondary">Upload Directory</td>
                    <td>Stored securely using S3/MinIO central media engine</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light text-secondary">Password Storage</td>
                    <td>Symmetrically encrypted using <code>aes-256-cbc</code> before database persistence</td>
                  </tr>
                </tbody>
              </Table>
              <div className="alert alert-warning mb-0 mt-3 d-flex align-items-start gap-2">
                <Icon icon="solar:danger-triangle-bold" className="text-warning flex-shrink-0" width="20" />
                <span className="small">
                  Note: Security policies are enforced at both frontend client form validation and backend server filters to prevent malware vectors.
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-bottom py-3">
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:history-bold" className="text-success" /> Sync Strategy & Cron Jobs
              </h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <p className="text-secondary small">
                  The BPA Mailing system utilizes a dual phase synchronization strategy to download domain emails from the official cPanel IMAP server:
                </p>
                <ol className="small ps-3 text-secondary mb-3">
                  <li className="mb-2">
                    <strong>Phase 1 (Manual Sync):</strong> Admin triggers immediate fetching of the latest 50 emails by clicking the "Sync Mailbox" button on the Inbox dashboard.
                  </li>
                  <li className="mb-2">
                    <strong>Phase 2 (Background Job):</strong> Server runs an automated task scheduler every 5 minutes executing a cron job to synchronize new emails incrementally using <code>UID / messageId</code> duplication checks.
                  </li>
                </ol>
                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold text-dark">Incremental Cron Interval</span>
                    <Badge bg="success">Active</Badge>
                  </div>
                  <code className="small text-success">*/5 * * * * (Every 5 minutes)</code>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button as={Link as any} href="/mail/accounts" variant="outline-primary" size="sm" className="d-flex align-items-center gap-1">
                  <Icon icon="solar:user-linear" /> Mailbox Accounts
                </Button>
                <Button as={Link as any} href="/email-layouts" variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                  <Icon icon="solar:letter-linear" /> Email Layouts
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}
