'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge, Spinner, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import { mailApi, type MailMessage, type MailAccount, type MailRecipient, type MailAttachment, type MailInternalNote } from '@/lib/api/mail.api'
import { emailLayoutsApi, type EmailLayoutSetting } from '@/lib/api/email-layouts.api'
import { mediaApi } from '@/lib/api/media.api'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic ReactQuill for SSR safety
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const TOOLBAR_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
}

const FORMATS = ['bold', 'italic', 'underline', 'strike', 'list', 'link']

// Safe HTML IFrame component to isolate email styles
function SafeHtmlIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #334155;
              margin: 8px;
              padding: 0;
            }
            img { max-width: 100%; height: auto; }
            a { color: #1a6b3c; text-decoration: underline; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `)
    doc.close()

    // Adjust height dynamically
    const resizeObserver = new ResizeObserver(() => {
      if (iframe.contentWindow) {
        iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight + 30}px`
      }
    })

    if (iframe.contentWindow?.document.body) {
      resizeObserver.observe(iframe.contentWindow.document.body)
    }

    return () => resizeObserver.disconnect()
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', border: 'none', minHeight: '100px', overflow: 'hidden' }}
      title="Email Content"
      sandbox="allow-same-origin allow-popups"
    />
  )
}

export default function MailThreadDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const threadId = params.id as string

  const [messages, setMessages] = useState<MailMessage[]>([])
  const [mailboxId, setMailboxId] = useState('')
  const [subject, setSubject] = useState('')
  const [internalNotes, setInternalNotes] = useState<MailInternalNote[]>([])
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Configurations
  const [accounts, setAccounts] = useState<MailAccount[]>([])
  const [templates, setTemplates] = useState<EmailLayoutSetting[]>([])

  // Reply Form State
  const [replyBody, setReplyBody] = useState('')
  const [replyToAddresses, setReplyToAddresses] = useState<string[]>([])
  const [ccAddresses, setCcAddresses] = useState<string[]>([])
  const [bccAddresses, setBccAddresses] = useState<string[]>([])
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('')

  // Internal Notes State
  const [noteText, setNoteText] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  // Attachments State
  const [attachments, setAttachments] = useState<Array<{
    id: string
    filename: string
    contentType: string
    size: number
    storagePath: string
    url: string
  }>>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [hasUploadError, setHasUploadError] = useState(false)

  // Retrieve thread information
  const loadThread = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await mailApi.getThreadDetails(threadId)
      
      // Sort messages chronologically (oldest to newest)
      const sortedMsgs = res.messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setMessages(sortedMsgs)
      setMailboxId(sortedMsgs.length > 0 ? sortedMsgs[0].mailboxId : '')
      setSubject(res.thread.subject)
      setInternalNotes(res.thread.internalNotes || [])

      // Set default reply recipient (sender of the latest message)
      if (sortedMsgs.length > 0) {
        const latestMsg = sortedMsgs[sortedMsgs.length - 1]
        setReplyToAddresses([latestMsg.fromAddress])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load conversation thread.')
    } finally {
      setLoading(false)
    }
  }, [threadId])

  // Load active accounts and layouts
  const loadConfig = async () => {
    try {
      const [accs, layouts] = await Promise.all([
        mailApi.listAccounts(),
        emailLayoutsApi.list(),
      ])
      setAccounts(accs.filter(a => a.status === 'active'))
      const activeLayouts = layouts.filter(l => l.status === 'active')
      setTemplates(activeLayouts)
      
      // Select default template if it exists
      const defaultLayout = activeLayouts.find(l => l.isDefault)
      if (defaultLayout) {
        setSelectedTemplateKey(defaultLayout.id)
      }
    } catch (err) {
      console.error('Failed to load layouts or accounts:', err)
    }
  }

  useEffect(() => {
    loadThread()
    loadConfig()
  }, [loadThread])

  // Find sender account info
  const senderAccount = useMemo(() => {
    return accounts.find(a => a.id === mailboxId)
  }, [accounts, mailboxId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setUploadingFiles(true)
    setError('')
    setHasUploadError(false)

    const BLOCKED_EXTENSIONS = ['.exe', '.js', '.sh', '.bat', '.cmd', '.scr', '.msi', '.vbs', '.com']
    const MAX_SIZE = 15 * 1024 * 1024 // 15MB

    try {
      for (const file of files) {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (BLOCKED_EXTENSIONS.includes(ext)) {
          throw new Error(`File type "${ext}" is blocked for security reasons.`)
        }
        if (file.size > MAX_SIZE) {
          throw new Error(`File "${file.name}" exceeds the maximum allowed size of 15MB.`)
        }

        const uploaded = await mediaApi.upload(file)
        setAttachments(prev => [
          ...prev,
          {
            id: uploaded.id,
            filename: uploaded.originalName,
            contentType: uploaded.mimeType,
            size: parseInt(uploaded.sizeBytes) || file.size,
            storagePath: uploaded.filename,
            url: uploaded.url,
          },
        ])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to upload attachments.')
      setHasUploadError(true)
    } finally {
      setUploadingFiles(false)
      e.target.value = '' // Clear input
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setHasUploadError(false)
      }
      return updated
    })
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyBody || replyBody.trim() === '<p><br></p>' || replyBody.trim() === '') {
      setError('Please compose a message body first.')
      return
    }

    if (hasUploadError) {
      setError('Cannot send reply: one or more attachment uploads failed. Please remove failed attachments or re-upload them.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const latestMsg = messages[messages.length - 1]
      const payload = {
        fromAccountId: mailboxId,
        to: replyToAddresses,
        cc: ccAddresses.length > 0 ? ccAddresses : undefined,
        bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
        subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
        bodyHtml: replyBody,
        plainText: replyBody.replace(/<[^>]*>/g, ''), // Strip html tags for plain text fallback
        attachmentIds: attachments.length > 0 ? attachments.map(a => a.id) : undefined,
        useTemplate,
        layoutKey: useTemplate && selectedTemplateKey ? selectedTemplateKey : undefined,
        inReplyTo: latestMsg.messageId,
        references: latestMsg.references 
          ? `${latestMsg.references} ${latestMsg.messageId}` 
          : latestMsg.messageId,
        threadId,
      }

      await mailApi.replyMail(payload)
      setSuccess('Reply sent successfully.')
      setReplyBody('')
      setAttachments([])
      
      // Reload thread to show new message
      await loadThread()
    } catch (err: any) {
      setError(err?.message || 'Failed to send reply.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim()) return

    setSubmittingNote(true)
    setError('')
    try {
      const newNote = await mailApi.createInternalNote(threadId, noteText)
      setInternalNotes(prev => [...prev, newNote])
      setNoteText('')
      setSuccess('Internal note added successfully.')
    } catch (err: any) {
      setError(err?.message || 'Failed to add internal note.')
    } finally {
      setSubmittingNote(false)
    }
  }

  // Format Helper functions
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button as={Link as any} href="/mail/inbox" variant="light" size="sm" className="d-flex align-items-center gap-1 border">
          <Icon icon="solar:arrow-left-linear" /> Back to Inbox
        </Button>
        <span className="text-muted">/</span>
        <span className="text-secondary small">Email Thread details</span>
      </div>

      <PageHeader title={subject || 'Conversation Thread'} breadcrumbs={[{ label: 'Mail' }, { label: 'Inbox', href: '/mail/inbox' }, { label: 'Thread' }]} />

      {error && <Alert variant="danger" dismissible onClose={() => { setError(''); setHasUploadError(false); }}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Loading conversation history...</p>
        </div>
      ) : (
        <Row>
          {/* Main conversation column */}
          <Col lg={9} md={12}>
            {/* Conversation Stream */}
            <div className="d-flex flex-column gap-4 mb-4">
              {messages.map((msg, index) => {
                const isSentByMe = msg.status !== 'received'
                return (
                  <Card key={msg.id} className={`border-0 shadow-sm ${isSentByMe ? 'border-start border-success border-4' : 'border-start border-primary border-4'}`}>
                    <Card.Header className="bg-transparent border-0 pt-3 pb-2 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <h6 className="mb-0 fw-bold text-dark">{msg.fromName || msg.fromAddress}</h6>
                          <span className="small text-muted">&lt;{msg.fromAddress}&gt;</span>
                          {isSentByMe && <Badge bg="success-subtle" className="text-success border border-success">Sent Log</Badge>}
                          {!isSentByMe && <Badge bg="primary-subtle" className="text-primary border border-primary">Incoming</Badge>}
                        </div>
                        <div className="small text-muted mt-1" style={{ fontSize: '12px' }}>
                          To:{' '}
                          {msg.recipients
                            ?.filter(r => r.type === 'to')
                            .map(r => r.emailAddress)
                            .join(', ') || senderAccount?.emailAddress}
                          {msg.recipients?.some(r => r.type === 'cc') && (
                            <>
                              {' '}
                              | CC:{' '}
                              {msg.recipients
                                .filter(r => r.type === 'cc')
                                .map(r => r.emailAddress)
                                .join(', ')}
                            </>
                          )}
                        </div>
                      </div>
                      <span className="small text-secondary">{formatDate(msg.date)}</span>
                    </Card.Header>
                    
                    <Card.Body className="pt-1 pb-3">
                      {/* Render Sanitized bodyHtml inside our isolated frame */}
                      <div className="border rounded bg-white p-2 mb-3">
                        <SafeHtmlIframe html={msg.bodyHtml} />
                      </div>

                      {/* Message attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3">
                          <h6 className="fw-semibold text-secondary small mb-2 d-flex align-items-center gap-1">
                            <Icon icon="solar:paperclip-linear" /> Attachments ({msg.attachments.length})
                          </h6>
                          <Row className="g-2">
                            {msg.attachments.map((att: MailAttachment) => (
                              <Col key={att.id} md={6} lg={4}>
                                <Card className="p-2 border bg-light d-flex flex-row align-items-center justify-content-between gap-2">
                                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                                    <Icon icon="solar:document-linear" className="text-primary flex-shrink-0" width="24" />
                                    <div className="text-truncate">
                                      <div className="small text-truncate fw-semibold mb-0" title={att.filename}>
                                        {att.filename}
                                      </div>
                                      <span className="text-muted" style={{ fontSize: '10px' }}>
                                        {formatSize(att.size)}
                                      </span>
                                    </div>
                                  </div>
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary p-1">
                                    <Icon icon="solar:download-linear" />
                                  </a>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                )
              })}
            </div>

            {/* Internal Discussion Notes */}
            <Card className="border-0 shadow-sm mb-4" style={{ backgroundColor: '#fffdf5', borderLeft: '4px solid #f59e0b' }}>
              <Card.Header className="bg-transparent border-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ color: '#b45309' }}>
                  <Icon icon="solar:notes-bold" width="20" className="text-warning" />
                  Internal Discussion Notes (Private)
                </h6>
                <Badge bg="warning" className="text-dark">Team Only</Badge>
              </Card.Header>
              <Card.Body className="pt-0">
                <p className="small text-muted mb-3">These notes are only visible to BPA Staff/Admins and are never sent to the client.</p>
                
                {internalNotes.length === 0 ? (
                  <p className="text-muted small italic mb-3">No internal discussion logged for this thread.</p>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {internalNotes.map(note => (
                      <div key={note.id} className="p-3 rounded bg-white border border-warning-subtle small shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
                          <span className="fw-bold text-dark d-flex align-items-center gap-1">
                            <Icon icon="solar:user-circle-bold-duotone" width="16" className="text-secondary" />
                            {note.createdBy?.name || 'Staff User'}
                          </span>
                          <span className="text-muted" style={{ fontSize: '11px' }}>{formatDate(note.createdAt)}</span>
                        </div>
                        <div className="text-secondary mt-1" dangerouslySetInnerHTML={{ __html: note.note }} />
                      </div>
                    ))}
                  </div>
                )}

                <Form onSubmit={handleAddInternalNote}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Add an internal note or discussion point for team members..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button variant="warning" type="submit" size="sm" disabled={submittingNote || !noteText.trim()}>
                      {submittingNote ? 'Adding note...' : 'Add Private Note'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Inline Reply Form */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-transparent border-bottom py-3">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <Icon icon="solar:reply-bold" className="text-primary" /> Reply to this conversation
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSendReply}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">From Account</Form.Label>
                        <Form.Select disabled value={mailboxId}>
                          {senderAccount ? (
                            <option value={senderAccount.id}>
                              {senderAccount.displayName} &lt;{senderAccount.emailAddress}&gt; (cPanel Outgoing)
                            </option>
                          ) : (
                            <option value="">{mailboxId}</option>
                          )}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Replies are always dispatched from the original mailbox.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">To Recipients</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder="Comma separated emails"
                          value={replyToAddresses.join(', ')}
                          onChange={e => setReplyToAddresses(e.target.value.split(',').map(s => s.trim()))}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Cc</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Comma separated emails (optional)"
                          value={ccAddresses.join(', ')}
                          onChange={e => setCcAddresses(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Bcc</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Comma separated emails (optional)"
                          value={bccAddresses.join(', ')}
                          onChange={e => setBccAddresses(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Rich Text Editor Body */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Message Body</Form.Label>
                    <div style={{ minHeight: '220px' }}>
                      <ReactQuill
                        theme="snow"
                        value={replyBody}
                        onChange={setReplyBody}
                        modules={TOOLBAR_MODULES}
                        formats={FORMATS}
                        style={{ height: '180px' }}
                      />
                    </div>
                  </Form.Group>

                  {/* Templates integrations */}
                  <Row className="bg-light p-3 rounded mb-3 mx-0 align-items-center">
                    <Col md={4} className="d-flex align-items-center mb-2 mb-md-0">
                      <Form.Check
                        type="switch"
                        id="useTemplateSwitch"
                        label="Apply central layout"
                        checked={useTemplate}
                        onChange={e => setUseTemplate(e.target.checked)}
                      />
                    </Col>
                    <Col md={8}>
                      {useTemplate && (
                        <Form.Group className="mb-0">
                          <Form.Select
                            size="sm"
                            value={selectedTemplateKey}
                            onChange={e => setSelectedTemplateKey(e.target.value)}
                          >
                            <option value="">-- Select Active Layout Setting --</option>
                            {templates.map(tpl => (
                              <option key={tpl.id} value={tpl.id}>
                                {tpl.name} ({tpl.locale === 'bn' ? 'Bangla' : 'English'})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      )}
                    </Col>
                  </Row>

                  {/* File attachments */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Attachments</Form.Label>
                    <div className="border border-dashed p-3 text-center rounded bg-white">
                      <Icon icon="solar:upload-minimalistic-linear" width="32" className="text-secondary mb-2" />
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={uploadingFiles}
                          style={{ position: 'relative', overflow: 'hidden' }}
                        >
                          {uploadingFiles ? 'Uploading Files...' : 'Choose Files'}
                          <input
                            type="file"
                            multiple
                            style={{ position: 'absolute', top: 0, right: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                            onChange={handleFileUpload}
                            disabled={uploadingFiles}
                          />
                        </Button>
                      </div>
                      <span className="small text-muted d-block mt-2">
                        Supported: PDF, Images, Word/Excel, ZIP. Limit: 15MB. Blocked: .exe, .js
                      </span>
                    </div>

                    {attachments.length > 0 && (
                      <div className="mt-3">
                        <span className="small fw-semibold text-secondary">Uploaded Files to attach:</span>
                        <div className="d-flex flex-column gap-2 mt-1">
                          {attachments.map((att, idx) => (
                            <div key={idx} className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                              <span className="small fw-medium text-truncate" style={{ maxWidth: '80%' }}>
                                <Icon icon="solar:paperclip-linear" className="me-2" /> {att.filename} ({formatSize(att.size)})
                              </span>
                              <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveAttachment(idx)}>
                                <Icon icon="solar:close-circle-bold" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="primary" type="submit" disabled={submitting || uploadingFiles}>
                      {submitting ? 'Sending reply...' : 'Send Reply'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Right rail: account and thread metadata details */}
          <Col lg={3} md={12}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-transparent border-bottom py-3">
                <h6 className="mb-0 fw-bold">Active Mailbox Details</h6>
              </Card.Header>
              <Card.Body>
                {senderAccount ? (
                  <>
                    <div className="mb-3">
                      <span className="small text-muted d-block">Mailbox Name</span>
                      <span className="fw-semibold text-dark">{senderAccount.displayName}</span>
                    </div>
                    <div className="mb-3">
                      <span className="small text-muted d-block">Official Email</span>
                      <span className="small fw-semibold text-dark">{senderAccount.emailAddress}</span>
                    </div>
                    <div className="mb-3">
                      <span className="small text-muted d-block">IMAP Server</span>
                      <span className="small d-block text-secondary">
                        {!senderAccount.imapHost ? 'd552.dimedns.com:993 (Default)' : `${senderAccount.imapHost}:${senderAccount.imapPort}`}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="small text-muted d-block">SMTP Server</span>
                      <span className="small d-block text-secondary">
                        {!senderAccount.smtpHost ? 'd552.dimedns.com:465 (Default)' : `${senderAccount.smtpHost}:${senderAccount.smtpPort}`}
                      </span>
                    </div>
                    <div>
                      <Badge bg="success" className="w-100 py-2">
                        Connected & Active
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-muted small">Loading account details...</p>
                )}
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-bottom py-3">
                <h6 className="mb-0 fw-bold">Contact Email History</h6>
              </Card.Header>
              <Card.Body className="p-3">
                <p className="small text-muted">
                  Displays historical communication index for CRM analysis.
                </p>
                <div className="d-grid">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      if (messages.length > 0) {
                        const targetEmail = messages[messages.length - 1].fromAddress
                        router.push(`/contacts?email=${targetEmail}`)
                      }
                    }}
                  >
                    View CRM History
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}
