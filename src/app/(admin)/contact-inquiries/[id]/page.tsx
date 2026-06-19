'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, Badge, Button, Form, Modal, Tabs, Tab, Alert, Spinner,
} from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import {
  contactInquiryApi,
  type InquiryDetail,
  type InquiryStatus,
  type InquiryPriority,
} from '@/lib/api/contact-inquiry.api'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New', read: 'Read', pending: 'Pending', in_progress: 'In Progress',
  waiting_response: 'Waiting', resolved: 'Resolved', closed: 'Closed', spam: 'Spam',
}
const STATUS_VARIANT: Record<InquiryStatus, string> = {
  new: 'danger', read: 'secondary', pending: 'warning', in_progress: 'primary',
  waiting_response: 'info', resolved: 'success', closed: 'dark', spam: 'light',
}
const PRIORITY_VARIANT: Record<InquiryPriority, string> = {
  normal: 'secondary', high: 'warning', urgent: 'danger',
}

interface MailAccount { id: string; address: string; label?: string }

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Reply modal
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyData, setReplyData] = useState({ fromAccountId: '', subject: '', bodyHtml: '', markResolved: false })
  const [replying, setReplying] = useState(false)

  // Forward modal
  const [fwdOpen, setFwdOpen] = useState(false)
  const [fwdData, setFwdData] = useState({ fromAccountId: '', to: '', subject: '', bodyHtml: '', note: '' })
  const [forwarding, setForwarding] = useState(false)

  // SMS modal
  const [smsOpen, setSmsOpen] = useState(false)
  const [smsData, setSmsData] = useState({ phone: '', message: '' })
  const [sendingSms, setSendingSms] = useState(false)

  // Note
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([])

  const load = async () => {
    try {
      setLoading(true)
      const data = await contactInquiryApi.getById(id)
      setInquiry(data)
      setReplyData((d) => ({
        ...d,
        subject: `Re: ${data.subject}`,
      }))
      setSmsData((d) => ({ ...d, phone: data.phone || data.whatsapp || '' }))
    } catch (e: any) {
      setError(e.message ?? 'Failed to load inquiry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    api.get<MailAccount[]>('/admin/mail/accounts').then(setMailAccounts).catch(() => null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStatusChange = async (status: InquiryStatus) => {
    await contactInquiryApi.updateStatus(id, status)
    setInquiry((prev) => prev ? { ...prev, status } : prev)
  }

  const handleReply = async () => {
    if (!replyData.fromAccountId || !replyData.subject || !replyData.bodyHtml) return
    setReplying(true)
    try {
      await contactInquiryApi.reply(id, {
        fromAccountId: replyData.fromAccountId,
        to: [inquiry!.email],
        subject: replyData.subject,
        bodyHtml: replyData.bodyHtml,
        markResolved: replyData.markResolved,
      })
      setReplyOpen(false)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setReplying(false)
    }
  }

  const handleForward = async () => {
    if (!fwdData.fromAccountId || !fwdData.to || !fwdData.subject || !fwdData.bodyHtml) return
    setForwarding(true)
    try {
      await contactInquiryApi.forward(id, {
        fromAccountId: fwdData.fromAccountId,
        to: fwdData.to.split(',').map((s) => s.trim()),
        subject: fwdData.subject,
        bodyHtml: fwdData.bodyHtml,
        note: fwdData.note || undefined,
      })
      setFwdOpen(false)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setForwarding(false)
    }
  }

  const handleSendSms = async () => {
    if (!smsData.phone || !smsData.message) return
    setSendingSms(true)
    try {
      await contactInquiryApi.sendSms(id, smsData)
      setSmsOpen(false)
      alert('SMS sent successfully')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSendingSms(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      await contactInquiryApi.addNote(id, newNote.trim())
      setNewNote('')
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return
    await contactInquiryApi.deleteNote(id, noteId)
    load()
  }

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner /></div>
  if (error) return <Alert variant="danger">{error}</Alert>
  if (!inquiry) return null

  return (
    <div className="container-fluid">
      <PageHeader
        title={inquiry.ticketNumber}
        breadcrumbs={[
          { label: 'Contact Inquiries', href: '/contact-inquiries' },
          { label: inquiry.ticketNumber },
        ]}
        action={
          <div className="d-flex gap-2 flex-wrap">
            <Button size="sm" variant="outline-primary" onClick={() => setReplyOpen(true)}>
              <Icon icon="solar:reply-bold" className="me-1" /> Reply
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => setFwdOpen(true)}>
              <Icon icon="solar:forward-bold" className="me-1" /> Forward
            </Button>
            {(inquiry.phone || inquiry.whatsapp) && (
              <Button size="sm" variant="outline-success" onClick={() => setSmsOpen(true)}>
                <Icon icon="solar:chat-round-dots-bold" className="me-1" /> SMS
              </Button>
            )}
            <Form.Select
              size="sm"
              style={{ maxWidth: 160 }}
              value={inquiry.status}
              onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
            >
              {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Form.Select>
            <Button size="sm" variant="outline-secondary" onClick={() => router.push('/contact-inquiries')}>
              ← Back
            </Button>
          </div>
        }
      />

      <div className="row g-3">
        {/* Left: inquiry detail */}
        <div className="col-lg-8">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Badge bg={PRIORITY_VARIANT[inquiry.priority]} className="me-2">
                  {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)} priority
                </Badge>
                <Badge bg={STATUS_VARIANT[inquiry.status]}>{STATUS_LABELS[inquiry.status]}</Badge>
              </div>
              <small className="text-muted">{new Date(inquiry.createdAt).toLocaleString()}</small>
            </Card.Header>
            <Card.Body>
              <h5 className="fw-bold mb-1">{inquiry.subject}</h5>
              <div className="text-muted mb-3">
                From: <strong>{inquiry.name}</strong> &lt;{inquiry.email}&gt;
                {inquiry.phone && <span className="ms-2">· {inquiry.phone}</span>}
                {inquiry.whatsapp && inquiry.whatsapp !== inquiry.phone && <span className="ms-2">WhatsApp: {inquiry.whatsapp}</span>}
              </div>

              {inquiry.organizationName && (
                <p className="text-muted small mb-1">
                  {inquiry.organizationName}{inquiry.designation ? ` — ${inquiry.designation}` : ''}
                  {inquiry.website && <> · <a href={inquiry.website} target="_blank" rel="noreferrer">{inquiry.website}</a></>}
                </p>
              )}

              {(inquiry.country || inquiry.city) && (
                <p className="text-muted small mb-3">
                  <Icon icon="solar:map-point-bold" className="me-1" />
                  {[inquiry.city, inquiry.country].filter(Boolean).join(', ')}
                </p>
              )}

              <hr />
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{inquiry.message}</div>

              {inquiry.attachmentUrl && (
                <div className="mt-3">
                  <a href={inquiry.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                    <Icon icon="solar:paperclip-bold" className="me-1" /> Attachment
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Thread */}
          <Tabs defaultActiveKey="replies" className="mb-3">
            <Tab eventKey="replies" title={`Replies (${inquiry.replies.length})`}>
              {inquiry.replies.length === 0 ? (
                <p className="text-muted text-center py-3">No replies yet</p>
              ) : (
                inquiry.replies.map((r) => (
                  <Card key={r.id} className="mb-2">
                    <Card.Header className="small text-muted d-flex justify-content-between">
                      <span>Sent by <strong>{r.sentBy.name}</strong> to {r.toAddresses.join(', ')}</span>
                      <span>{new Date(r.sentAt).toLocaleString()}</span>
                    </Card.Header>
                    <Card.Body>
                      <div className="fw-medium mb-1">{r.subject}</div>
                      <div dangerouslySetInnerHTML={{ __html: r.bodyHtml }} />
                    </Card.Body>
                  </Card>
                ))
              )}
            </Tab>

            <Tab eventKey="forwards" title={`Forwards (${inquiry.forwards.length})`}>
              {inquiry.forwards.length === 0 ? (
                <p className="text-muted text-center py-3">No forwards yet</p>
              ) : (
                inquiry.forwards.map((f) => (
                  <Card key={f.id} className="mb-2">
                    <Card.Header className="small text-muted d-flex justify-content-between">
                      <span>Forwarded by <strong>{f.forwardedBy.name}</strong> to {f.toAddresses.join(', ')}</span>
                      <span>{new Date(f.forwardedAt).toLocaleString()}</span>
                    </Card.Header>
                    {f.note && <Card.Body><em className="text-muted small">Note: {f.note}</em></Card.Body>}
                  </Card>
                ))
              )}
            </Tab>

            <Tab eventKey="notes" title={`Notes (${inquiry.internalNotes.length})`}>
              <div className="mb-3">
                {inquiry.internalNotes.map((n) => (
                  <Card key={n.id} className="mb-2 border-warning-subtle">
                    <Card.Body className="py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <small className="text-muted">{n.createdBy.name} · {new Date(n.createdAt).toLocaleString()}</small>
                          <p className="mb-0 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{n.note}</p>
                        </div>
                        <Button size="sm" variant="link" className="text-danger p-0 ms-2" onClick={() => handleDeleteNote(n.id)}>
                          <Icon icon="solar:trash-bin-minimalistic-bold" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add internal note…"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button variant="warning" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                  {addingNote ? <Spinner size="sm" /> : 'Add'}
                </Button>
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Right: sidebar */}
        <div className="col-lg-4">
          <Card className="mb-3">
            <Card.Header><strong>Contact Type &amp; Category</strong></Card.Header>
            <Card.Body className="small">
              <div className="mb-1"><span className="text-muted">Type:</span> {inquiry.contactType?.labelEn ?? '—'}</div>
              <div><span className="text-muted">Category:</span> {inquiry.category?.labelEn ?? '—'}</div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header><strong>Assignment</strong></Card.Header>
            <Card.Body className="small">
              <div className="mb-1"><span className="text-muted">Department:</span> {inquiry.department?.nameEn ?? '—'}</div>
              <div><span className="text-muted">Assigned to:</span> {inquiry.assignedTo?.name ?? '—'}</div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header><strong>Metadata</strong></Card.Header>
            <Card.Body className="small">
              {inquiry.source && <div className="mb-1"><span className="text-muted">Source:</span> {inquiry.source}</div>}
              {inquiry.ipAddress && <div className="mb-1"><span className="text-muted">IP:</span> {inquiry.ipAddress}</div>}
              {inquiry.readAt && <div className="mb-1"><span className="text-muted">Read:</span> {new Date(inquiry.readAt).toLocaleString()}</div>}
              {inquiry.resolvedAt && <div className="mb-1"><span className="text-muted">Resolved:</span> {new Date(inquiry.resolvedAt).toLocaleString()}</div>}
              <div><span className="text-muted">Consent:</span> {inquiry.consentGiven ? 'Yes' : 'No'}</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal show={replyOpen} onHide={() => setReplyOpen(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Reply to Inquiry</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>From Account</Form.Label>
            <Form.Select value={replyData.fromAccountId} onChange={(e) => setReplyData((d) => ({ ...d, fromAccountId: e.target.value }))}>
              <option value="">Select mail account…</option>
              {mailAccounts.map((a) => <option key={a.id} value={a.id}>{a.label ?? a.address}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control value={replyData.subject} onChange={(e) => setReplyData((d) => ({ ...d, subject: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message (HTML)</Form.Label>
            <Form.Control as="textarea" rows={8} value={replyData.bodyHtml} onChange={(e) => setReplyData((d) => ({ ...d, bodyHtml: e.target.value }))} />
          </Form.Group>
          <Form.Check
            label="Mark as resolved after sending"
            checked={replyData.markResolved}
            onChange={(e) => setReplyData((d) => ({ ...d, markResolved: e.target.checked }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setReplyOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleReply} disabled={replying}>
            {replying ? <Spinner size="sm" /> : 'Send Reply'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Forward Modal */}
      <Modal show={fwdOpen} onHide={() => setFwdOpen(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Forward Inquiry</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>From Account</Form.Label>
            <Form.Select value={fwdData.fromAccountId} onChange={(e) => setFwdData((d) => ({ ...d, fromAccountId: e.target.value }))}>
              <option value="">Select mail account…</option>
              {mailAccounts.map((a) => <option key={a.id} value={a.id}>{a.label ?? a.address}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>To (comma-separated)</Form.Label>
            <Form.Control value={fwdData.to} onChange={(e) => setFwdData((d) => ({ ...d, to: e.target.value }))} placeholder="email1@example.com, email2@example.com" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control value={fwdData.subject} onChange={(e) => setFwdData((d) => ({ ...d, subject: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message (HTML)</Form.Label>
            <Form.Control as="textarea" rows={8} value={fwdData.bodyHtml} onChange={(e) => setFwdData((d) => ({ ...d, bodyHtml: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Internal Note (optional)</Form.Label>
            <Form.Control value={fwdData.note} onChange={(e) => setFwdData((d) => ({ ...d, note: e.target.value }))} placeholder="Why are you forwarding this?" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setFwdOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleForward} disabled={forwarding}>
            {forwarding ? <Spinner size="sm" /> : 'Forward'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SMS Modal */}
      <Modal show={smsOpen} onHide={() => setSmsOpen(false)}>
        <Modal.Header closeButton><Modal.Title>Send SMS</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control value={smsData.phone} onChange={(e) => setSmsData((d) => ({ ...d, phone: e.target.value }))} placeholder="+880 1xxx-xxxxxx" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={4} maxLength={500} value={smsData.message} onChange={(e) => setSmsData((d) => ({ ...d, message: e.target.value }))} />
            <Form.Text className="text-muted">{smsData.message.length}/500</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSmsOpen(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSendSms} disabled={sendingSms}>
            {sendingSms ? <Spinner size="sm" /> : 'Send SMS'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
