'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge, Spinner, InputGroup, Pagination } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { mailApi, type MailMessage, type MailAccount } from '@/lib/api/mail.api'

export default function MailInboxPage() {
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [accounts, setAccounts] = useState<MailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Search & Filter State
  const [selectedMailboxId, setSelectedMailboxId] = useState<string>('') // empty for Unified
  const [selectedStatus, setSelectedStatus] = useState<'received' | 'sent_success' | 'sent_failed' | ''>('received')
  const [searchQuery, setSearchQuery] = useState('')
  const [isReadFilter, setIsReadFilter] = useState<'true' | 'false' | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination State
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const loadAccounts = async () => {
    try {
      const data = await mailApi.listAccounts()
      setAccounts(data)
    } catch (err: any) {
      console.error('Failed to load accounts in inbox:', err)
    }
  }

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        page,
        limit,
      }
      if (selectedMailboxId) params.mailboxId = selectedMailboxId
      if (selectedStatus) params.status = selectedStatus
      if (isReadFilter) params.isRead = isReadFilter
      if (searchQuery) params.search = searchQuery
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const res = await mailApi.getInbox(params)
      setMessages(res.data)
      setTotal(res.meta.total)
      setTotalPages(res.meta.totalPages)
    } catch (err: any) {
      setError(err?.message || 'Failed to load email messages.')
    } finally {
      setLoading(false)
    }
  }, [page, limit, selectedMailboxId, selectedStatus, isReadFilter, searchQuery, startDate, endDate])

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleSync = async () => {
    setSyncing(true)
    setError('')
    setSuccess('')
    try {
      const res = await mailApi.syncMailbox(selectedMailboxId || undefined)
      setSuccess(res.message || 'Sync completed successfully.')
      loadMessages()
    } catch (err: any) {
      setError(err?.message || 'Synchronization failed.')
    } finally {
      setSyncing(false)
    }
  }

  const handleResetFilters = () => {
    setSelectedMailboxId('')
    setSelectedStatus('received')
    setSearchQuery('')
    setIsReadFilter('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  // Format helper for dates
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // Get human friendly status badge
  const renderStatusBadge = (status: MailMessage['status']) => {
    switch (status) {
      case 'received':
        return null
      case 'sent_success':
        return <Badge bg="success">Sent</Badge>
      case 'sent_failed':
        return <Badge bg="danger">Failed</Badge>
      case 'draft':
        return (
          <Badge bg="warning" className="text-dark">
            Draft
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <PageHeader title="Official Webmail" breadcrumbs={[{ label: 'Mail' }, { label: 'Inbox' }]} />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Row>
        {/* LEFT COLUMN: Sidebar folders & filters */}
        <Col lg={3} md={4} className="mb-4">
          <div className="d-grid mb-3">
            <Button
              as={Link as any}
              href="/mail/compose"
              variant="primary"
              className="d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold shadow-sm">
              <Icon icon="solar:pen-bold" width="18" /> Compose Mail
            </Button>
          </div>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-2">
              <div className="px-3 pt-2 pb-1 text-muted uppercase fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Folders
              </div>
              <ul className="list-unstyled mb-3">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('received')
                      setPage(1)
                    }}
                    className={`w-100 border-0 text-start px-3 py-2 rounded d-flex align-items-center justify-content-between ${selectedStatus === 'received' ? 'bg-primary-subtle text-primary fw-semibold' : 'bg-transparent text-secondary'}`}>
                    <span className="d-flex align-items-center gap-2">
                      <Icon icon="solar:inbox-line-bold" width="18" /> Inbox
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('sent_success')
                      setPage(1)
                    }}
                    className={`w-100 border-0 text-start px-3 py-2 rounded d-flex align-items-center justify-content-between ${selectedStatus === 'sent_success' ? 'bg-primary-subtle text-primary fw-semibold' : 'bg-transparent text-secondary'}`}>
                    <span className="d-flex align-items-center gap-2">
                      <Icon icon="solar:square-share-line-bold" width="18" /> Sent Logs
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('sent_failed')
                      setPage(1)
                    }}
                    className={`w-100 border-0 text-start px-3 py-2 rounded d-flex align-items-center justify-content-between ${selectedStatus === 'sent_failed' ? 'bg-primary-subtle text-primary fw-semibold' : 'bg-transparent text-secondary'}`}>
                    <span className="d-flex align-items-center gap-2">
                      <Icon icon="solar:danger-bold" width="18" /> Failed Sent
                    </span>
                  </button>
                </li>
              </ul>

              <div className="px-3 pt-2 pb-1 text-muted uppercase fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Mailboxes
              </div>
              <ul className="list-unstyled mb-2">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMailboxId('')
                      setPage(1)
                    }}
                    className={`w-100 border-0 text-start px-3 py-2 rounded d-flex align-items-center justify-content-between ${selectedMailboxId === '' ? 'bg-primary-subtle text-primary fw-semibold' : 'bg-transparent text-secondary'}`}>
                    <span className="d-flex align-items-center gap-2">
                      <Icon icon="solar:mailbox-bold" width="18" /> Unified Inbox
                    </span>
                  </button>
                </li>
                {accounts.map((acc) => (
                  <li key={acc.id} className="list-unstyled">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMailboxId(acc.id)
                        setPage(1)
                      }}
                      className={`w-100 border-0 text-start px-3 py-2 rounded d-flex align-items-center justify-content-between ${selectedMailboxId === acc.id ? 'bg-primary-subtle text-primary fw-semibold' : 'bg-transparent text-secondary'}`}
                      style={{ fontSize: '13px' }}>
                      <span className="d-flex align-items-center gap-2 text-truncate" title={acc.emailAddress}>
                        <Icon icon="solar:user-bold" width="16" className="flex-shrink-0" />
                        <span className="text-truncate">{acc.emailAddress}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Advanced Filters</h6>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Read/Unread Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={isReadFilter}
                  onChange={(e) => {
                    setIsReadFilter(e.target.value as any)
                    setPage(1)
                  }}>
                  <option value="">All Message Status</option>
                  <option value="false">Unread</option>
                  <option value="true">Read</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">From Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPage(1)
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">To Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPage(1)
                  }}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN: Messages Listing */}
        <Col lg={9} md={8}>
          <Card className="border-0 shadow-sm">
            {/* Header controls */}
            <Card.Header className="bg-transparent border-bottom py-3">
              <Row className="g-2 align-items-center">
                <Col md={7}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <Icon icon="solar:magnifer-linear" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by sender, subject, body content..."
                      className="bg-light border-start-0"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setPage(1)
                      }}
                    />
                  </InputGroup>
                </Col>
                <Col md={5} className="d-flex justify-content-md-end justify-content-between align-items-center gap-2">
                  <Button variant="outline-primary" onClick={handleSync} disabled={syncing} className="d-flex align-items-center gap-1">
                    <Icon icon="solar:refresh-linear" width="16" className={syncing ? 'spin-animation' : ''} />
                    {syncing ? 'Syncing...' : 'Sync Mailbox'}
                  </Button>
                  <Button as={Link as any} href="/mail/accounts" variant="outline-secondary" className="d-flex align-items-center gap-1">
                    <Icon icon="solar:settings-linear" width="16" />
                    Manage Accounts
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-2 mb-0">Loading messages from database...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Icon icon="solar:letter-linear" width="64" className="text-secondary mb-3" />
                  <h5 className="fw-semibold">No emails found</h5>
                  <p className="small mb-0">No messages match the current folder or filter criteria.</p>
                  <p className="small">Try syncing your mailbox or modifying search query.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {messages.map((msg) => (
                    <Link
                      key={msg.id}
                      href={`/mail/thread/${msg.threadId}`}
                      className={`list-group-item list-group-item-action border-bottom p-3 d-flex flex-column gap-1 ${!msg.isRead && msg.status === 'received' ? 'bg-light-subtle fw-semibold border-start border-primary border-4' : 'text-secondary'}`}
                      style={{ cursor: 'pointer', borderLeftWidth: !msg.isRead && msg.status === 'received' ? '4px' : '1px' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`text-dark ${!msg.isRead && msg.status === 'received' ? 'fw-bold' : ''}`}>
                            {msg.fromName || msg.fromAddress}
                          </span>
                          {/* Mailbox identifier badge */}
                          {msg.mailbox && (
                            <Badge
                              bg="secondary-subtle"
                              className="text-secondary border border-secondary font-weight-normal"
                              style={{ fontSize: '11px' }}>
                              {msg.mailbox.emailAddress}
                            </Badge>
                          )}
                          {renderStatusBadge(msg.status)}
                        </div>
                        <span className="small text-muted">{formatDate(msg.date)}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <div className="text-truncate pe-3" style={{ maxWidth: '80%' }}>
                          <span className={!msg.isRead && msg.status === 'received' ? 'text-dark fw-semibold' : 'text-dark'}>
                            {msg.subject || '(No Subject)'}
                          </span>
                          <span className="text-muted small ms-2 text-truncate font-weight-light">
                            - {msg.bodyText ? msg.bodyText.substring(0, 100) : ''}...
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {msg.attachments && msg.attachments.length > 0 && (
                            <span className="text-muted d-inline-flex" title={`${msg.attachments.length} attachment(s)`}>
                              <Icon icon="solar:paperclip-linear" />
                            </span>
                          )}
                          {!msg.isRead && msg.status === 'received' && (
                            <span className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }} />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>

            {/* Pagination footer */}
            {!loading && totalPages > 1 && (
              <Card.Footer className="bg-transparent d-flex justify-content-between align-items-center py-3">
                <span className="small text-muted">
                  Showing <b>{(page - 1) * limit + 1}</b> to <b>{Math.min(page * limit, total)}</b> of <b>{total}</b> emails
                </span>
                <Pagination className="mb-0">
                  <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <Pagination.Item key={idx} active={idx + 1 === page} onClick={() => setPage(idx + 1)}>
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
                </Pagination>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .bg-light-subtle {
          background-color: rgba(26, 107, 60, 0.04) !important;
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
