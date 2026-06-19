'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge, Table, Modal, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import { mailApi, type MailAccount } from '@/lib/api/mail.api'

export default function MailAccountsPage() {
  const [accounts, setAccounts] = useState<MailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Connection testing states
  const [testingSmtp, setTestingSmtp] = useState<Record<string, 'loading' | 'success' | 'failed' | null>>({})
  const [testingImap, setTestingImap] = useState<Record<string, 'loading' | 'success' | 'failed' | null>>({})
  const [testResults, setTestResults] = useState<Record<string, string>>({})

  // Form State
  const [form, setForm] = useState({
    displayName: '',
    emailAddress: '',
    smtpHost: '',
    smtpPort: '',
    smtpSecure: true,
    imapHost: '',
    imapPort: '',
    imapSecure: true,
    username: '',
    password: '',
    fromName: '',
    status: 'active' as 'active' | 'inactive',
    isDefault: false,
  })

  const loadAccounts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await mailApi.listAccounts()
      setAccounts(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load mail accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const handleOpenCreate = () => {
    setForm({
      displayName: '',
      emailAddress: '',
      smtpHost: '',
      smtpPort: '',
      smtpSecure: true,
      imapHost: '',
      imapPort: '',
      imapSecure: true,
      username: '',
      password: '',
      fromName: '',
      status: 'inactive', // Seed flow suggests keeping inactive until passwords updated
      isDefault: false,
    })
    setModalType('create')
    setSelectedAccountId(null)
    setShowAdvanced(false)
    setShowModal(true)
  }

  const handleOpenEdit = (account: MailAccount) => {
    setForm({
      displayName: account.displayName,
      emailAddress: account.emailAddress,
      smtpHost: account.smtpHost || '',
      smtpPort: account.smtpPort ? String(account.smtpPort) : '',
      smtpSecure: account.smtpSecure ?? true,
      imapHost: account.imapHost || '',
      imapPort: account.imapPort ? String(account.imapPort) : '',
      imapSecure: account.imapSecure ?? true,
      username: account.username,
      password: '', // Blank by default, only updated if filled
      fromName: account.fromName,
      status: account.status,
      isDefault: account.isDefault,
    })
    setModalType('edit')
    setSelectedAccountId(account.id)
    setShowAdvanced(!!(account.smtpHost || account.imapHost))
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const payload: any = {
      ...form,
      smtpHost: form.smtpHost ? form.smtpHost : null,
      smtpPort: form.smtpPort ? Number(form.smtpPort) : null,
      imapHost: form.imapHost ? form.imapHost : null,
      imapPort: form.imapPort ? Number(form.imapPort) : null,
    }

    try {
      if (modalType === 'create') {
        await mailApi.createAccount(payload)
        setSuccess('Mail account created successfully.')
      } else if (selectedAccountId) {
        // password is optional in patch, delete if empty
        if (!payload.password) {
          delete payload.password
        }
        await mailApi.updateAccount(selectedAccountId, payload)
        setSuccess('Mail account updated successfully.')
      }
      setShowModal(false)
      loadAccounts()
    } catch (err: any) {
      setError(err?.message || 'Failed to save mail account.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mail account? This cannot be undone.')) {
      return
    }
    setError('')
    setSuccess('')
    try {
      await mailApi.deleteAccount(id)
      setSuccess('Mail account deleted successfully.')
      loadAccounts()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete mail account.')
    }
  }

  const handleTestSmtp = async (id: string) => {
    setTestingSmtp(prev => ({ ...prev, [id]: 'loading' }))
    setError('')
    setSuccess('')
    try {
      const res = await mailApi.testSmtp(id)
      if (res.success) {
        setTestingSmtp(prev => ({ ...prev, [id]: 'success' }))
        setTestResults(prev => ({ ...prev, [`smtp-${id}`]: 'SMTP Connected Successfully!' }))
        setSuccess('SMTP server handshake succeeded! Connection is working.')
      } else {
        setTestingSmtp(prev => ({ ...prev, [id]: 'failed' }))
        setTestResults(prev => ({ ...prev, [`smtp-${id}`]: res.message || 'SMTP Connection Failed.' }))
        setError(`SMTP connection check failed: ${res.message || 'Verification rejected.'}`)
      }
    } catch (err: any) {
      setTestingSmtp(prev => ({ ...prev, [id]: 'failed' }))
      setTestResults(prev => ({ ...prev, [`smtp-${id}`]: err?.message || 'SMTP connection check encountered an error.' }))
      setError(`SMTP error: ${err?.message || 'Network timeout.'}`)
    }
  }

  const handleTestImap = async (id: string) => {
    setTestingImap(prev => ({ ...prev, [id]: 'loading' }))
    setError('')
    setSuccess('')
    try {
      const res = await mailApi.testImap(id)
      if (res.success) {
        setTestingImap(prev => ({ ...prev, [id]: 'success' }))
        setTestResults(prev => ({ ...prev, [`imap-${id}`]: 'IMAP Connected Successfully!' }))
        setSuccess('IMAP server handshake succeeded! Connection is working.')
      } else {
        setTestingImap(prev => ({ ...prev, [id]: 'failed' }))
        setTestResults(prev => ({ ...prev, [`imap-${id}`]: res.message || 'IMAP Connection Failed.' }))
        setError(`IMAP connection check failed: ${res.message || 'Verification rejected.'}`)
      }
    } catch (err: any) {
      setTestingImap(prev => ({ ...prev, [id]: 'failed' }))
      setTestResults(prev => ({ ...prev, [`imap-${id}`]: err?.message || 'IMAP connection check encountered an error.' }))
      setError(`IMAP error: ${err?.message || 'Network timeout.'}`)
    }
  }

  return (
    <>
      <PageHeader title="Mail Accounts" breadcrumbs={[{ label: 'Mail' }, { label: 'Accounts' }]} />

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
          <h5 className="mb-0 fw-bold text-dark">Official Mailboxes</h5>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="d-flex align-items-center gap-1">
            <Icon icon="solar:plus-linear" width="18" /> Add Account
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2 mb-0">Loading mail accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Icon icon="solar:mailbox-linear" width="48" className="mb-2 text-muted" />
              <p className="mb-0">No mail accounts configured yet.</p>
              <p className="small">Click "Add Account" to configure your first cPanel mailbox.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Display Name / Email</th>
                    <th>Outgoing (SMTP)</th>
                    <th>Incoming (IMAP)</th>
                    <th>Status</th>
                    <th>Connection Checks</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc.id}>
                      <td>
                        <div>
                          <span className="fw-semibold text-dark">{acc.displayName}</span>{' '}
                          {acc.isDefault && <Badge bg="success" className="ms-1">Default</Badge>}
                        </div>
                        <div className="small text-muted">{acc.emailAddress}</div>
                        <div className="small text-muted" style={{ fontSize: '11px' }}>Sender name: "{acc.fromName}"</div>
                      </td>
                      <td>
                        {!acc.smtpHost ? (
                          <Badge bg="light" className="text-primary border border-primary-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '10px' }} title="Using default server from environment">
                            <Icon icon="solar:server-bold-duotone" /> Default SMTP
                          </Badge>
                        ) : (
                          <>
                            <span className="small d-block text-secondary">
                              {acc.smtpHost}:{acc.smtpPort}
                            </span>
                            <Badge bg={acc.smtpSecure ? 'info' : 'secondary'} className="text-uppercase" style={{ fontSize: '10px' }}>
                              {acc.smtpSecure ? 'SSL/TLS' : 'Plain'}
                            </Badge>
                          </>
                        )}
                      </td>
                      <td>
                        {!acc.imapHost ? (
                          <Badge bg="light" className="text-primary border border-primary-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '10px' }} title="Using default server from environment">
                            <Icon icon="solar:server-bold-duotone" /> Default IMAP
                          </Badge>
                        ) : (
                          <>
                            <span className="small d-block text-secondary">
                              {acc.imapHost}:{acc.imapPort}
                            </span>
                            <Badge bg={acc.imapSecure ? 'info' : 'secondary'} className="text-uppercase" style={{ fontSize: '10px' }}>
                              {acc.imapSecure ? 'SSL/TLS' : 'Plain'}
                            </Badge>
                          </>
                        )}
                      </td>
                      <td>
                        <Badge bg={acc.status === 'active' ? 'success' : 'secondary'}>
                          {acc.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2 py-1" style={{ maxWidth: '280px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleTestSmtp(acc.id)}
                              disabled={testingSmtp[acc.id] === 'loading'}
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                            >
                              {testingSmtp[acc.id] === 'loading' ? 'Testing SMTP...' : 'Test SMTP'}
                            </Button>
                            {testingSmtp[acc.id] === 'success' && (
                              <Badge bg="success-subtle" className="text-success border border-success d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                <Icon icon="solar:check-circle-bold" /> OK
                              </Badge>
                            )}
                            {testingSmtp[acc.id] === 'failed' && (
                              <Badge bg="danger-subtle" className="text-danger border border-danger d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                <Icon icon="solar:danger-bold" /> Failed
                              </Badge>
                            )}
                          </div>
                          {testResults[`smtp-${acc.id}`] && (
                            <div className="text-muted text-truncate" style={{ fontSize: '10px' }} title={testResults[`smtp-${acc.id}`]}>
                              {testResults[`smtp-${acc.id}`]}
                            </div>
                          )}

                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleTestImap(acc.id)}
                              disabled={testingImap[acc.id] === 'loading'}
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                            >
                              {testingImap[acc.id] === 'loading' ? 'Testing IMAP...' : 'Test IMAP'}
                            </Button>
                            {testingImap[acc.id] === 'success' && (
                              <Badge bg="success-subtle" className="text-success border border-success d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                <Icon icon="solar:check-circle-bold" /> OK
                              </Badge>
                            )}
                            {testingImap[acc.id] === 'failed' && (
                              <Badge bg="danger-subtle" className="text-danger border border-danger d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                <Icon icon="solar:danger-bold" /> Failed
                              </Badge>
                            )}
                          </div>
                          {testResults[`imap-${acc.id}`] && (
                            <div className="text-muted text-truncate" style={{ fontSize: '10px' }} title={testResults[`imap-${acc.id}`]}>
                              {testResults[`imap-${acc.id}`]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(acc)}>
                          <Icon icon="solar:pen-bold" />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(acc.id)}>
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* CREATE/EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">
              {modalType === 'create' ? 'Add Mail Account' : 'Edit Mail Account'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h6 className="fw-bold mb-3 text-primary pb-1 border-bottom">1. Mailbox Identity</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Display Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. BPA Support, Office Info"
                    value={form.displayName}
                    onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="e.g. support@bangladeshpetassociation.com"
                    value={form.emailAddress}
                    onChange={e => setForm(prev => ({ ...prev, emailAddress: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Sender Name (From Name) *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. BPA Support"
                    value={form.fromName}
                    onChange={e => setForm(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                  <Form.Text className="text-muted">This is what recipients see as the sender.</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-primary pb-1 border-bottom mt-3">2. Server Authentication</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Username / Account Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Usually same as email address"
                    value={form.username}
                    onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Password {modalType === 'create' ? '*' : '(Leave empty to keep current)'}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    required={modalType === 'create'}
                    placeholder="Enter cPanel account password"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom mt-3">
              <h6 className="fw-bold mb-0 text-primary">3. Connection Configurations Override</h6>
              <Button 
                variant="link" 
                size="sm" 
                className="text-decoration-none p-0 d-flex align-items-center gap-1"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Icon icon={showAdvanced ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'} />
                {showAdvanced ? 'Hide override configurations' : 'Configure custom host overrides'}
              </Button>
            </div>

            {showAdvanced ? (
              <Row>
                <Col md={6}>
                  <Card className="p-3 bg-light border-0 mb-3">
                    <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '14px' }}>Outgoing SMTP Server</h6>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-semibold">SMTP Host</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Leave empty for env default"
                        value={form.smtpHost}
                        onChange={e => setForm(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </Form.Group>
                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small fw-semibold">SMTP Port</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="e.g. 465"
                            value={form.smtpPort}
                            onChange={e => setForm(prev => ({ ...prev, smtpPort: e.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} className="d-flex align-items-end">
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Use SSL/TLS"
                            checked={form.smtpSecure}
                            onChange={e => setForm(prev => ({ ...prev, smtpSecure: !!e.target.checked }))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="p-3 bg-light border-0 mb-3">
                    <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '14px' }}>Incoming IMAP Server</h6>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-semibold">IMAP Host</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Leave empty for env default"
                        value={form.imapHost}
                        onChange={e => setForm(prev => ({ ...prev, imapHost: e.target.value }))}
                      />
                    </Form.Group>
                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small fw-semibold">IMAP Port</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="e.g. 993"
                            value={form.imapPort}
                            onChange={e => setForm(prev => ({ ...prev, imapPort: e.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} className="d-flex align-items-end">
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Use SSL/TLS"
                            checked={form.imapSecure}
                            onChange={e => setForm(prev => ({ ...prev, imapSecure: !!e.target.checked }))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Alert variant="info" className="d-flex align-items-center gap-2 py-2 px-3 border-0 bg-opacity-10 bg-primary text-primary">
                <Icon icon="solar:info-circle-linear" width="20" />
                <span className="small">Using default cPanel configs from environment. No host configuration overrides set.</span>
              </Alert>
            )}

            <Row className="mt-2">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-center">
                <Form.Group className="mb-3 mt-3">
                  <Form.Check
                    type="checkbox"
                    id="isDefaultAccount"
                    label="Make Default Mail Account"
                    checked={form.isDefault}
                    onChange={e => setForm(prev => ({ ...prev, isDefault: !!e.target.checked }))}
                  />
                  <Form.Text className="text-muted d-block" style={{ fontSize: '11px' }}>
                    This account will be pre-selected on the compose screen.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Mail Account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
