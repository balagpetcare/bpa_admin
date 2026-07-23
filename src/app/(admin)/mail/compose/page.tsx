'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import { mailApi, type MailAccount } from '@/lib/api/mail.api'
import { emailLayoutsApi, type EmailLayoutSetting } from '@/lib/api/email-layouts.api'
import { mediaApi } from '@/lib/api/media.api'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic ReactQuill for SSR safety
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const TOOLBAR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ align: [] }],
    ['clean'],
  ],
}

const FORMATS = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'indent', 'blockquote', 'code-block', 'link', 'image', 'align']

export default function MailComposePage() {
  const router = useRouter()

  const [accounts, setAccounts] = useState<MailAccount[]>([])
  const [templates, setTemplates] = useState<EmailLayoutSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [fromAccountId, setFromAccountId] = useState('')
  const [toInput, setToInput] = useState('')
  const [ccInput, setCcInput] = useState('')
  const [bccInput, setBccInput] = useState('')
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('')

  // Attachments State
  const [attachments, setAttachments] = useState<
    Array<{
      id: string
      filename: string
      contentType: string
      size: number
      storagePath: string
      url: string
    }>
  >([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [hasUploadError, setHasUploadError] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [accs, layouts] = await Promise.all([mailApi.listAccounts(), emailLayoutsApi.list()])

      const activeAccounts = accs.filter((a) => a.status === 'active')
      setAccounts(activeAccounts)

      const activeLayouts = layouts.filter((l) => l.status === 'active')
      setTemplates(activeLayouts)

      // Set default from account
      const defaultAcc = activeAccounts.find((a) => a.isDefault) || activeAccounts[0]
      if (defaultAcc) {
        setFromAccountId(defaultAcc.id)
      }

      // Set default template if exists
      const defaultLayout = activeLayouts.find((l) => l.isDefault)
      if (defaultLayout) {
        setSelectedTemplateKey(defaultLayout.id)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load mail configuration details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
        setAttachments((prev) => [
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
    setAttachments((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setHasUploadError(false)
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromAccountId) {
      setError('Please select a sender account.')
      return
    }

    if (hasUploadError) {
      setError('Cannot send mail: one or more attachment uploads failed. Please remove failed attachments or re-upload them.')
      return
    }

    const normalizeEmails = (input: string) => {
      if (!input) return undefined
      const list = input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      return list.length > 0 ? list : undefined
    }

    const toList = normalizeEmails(toInput) || []
    if (toList.length === 0) {
      setError('Please add at least one recipient email address.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        fromAccountId,
        to: toList,
        cc: normalizeEmails(ccInput),
        bcc: normalizeEmails(bccInput),
        subject,
        bodyHtml,
        plainText: bodyHtml.replace(/<[^>]*>/g, ''), // Plain text strip
        attachmentIds: attachments.length > 0 ? attachments.map((a) => a.id) : undefined,
        useTemplate,
        layoutKey: useTemplate && selectedTemplateKey ? selectedTemplateKey : undefined,
      }

      await mailApi.sendMail(payload)
      setSuccess('Email sent successfully.')

      // Redirect to sent logs
      setTimeout(() => {
        router.push('/mail/inbox?status=sent_success')
      }, 1500)
    } catch (err: any) {
      setError(err?.message || 'Failed to send email.')
      setSubmitting(false)
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
        <span className="text-secondary small">Compose Email</span>
      </div>

      <PageHeader title="Compose Email" breadcrumbs={[{ label: 'Mail' }, { label: 'Compose' }]} />

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => {
            setError('')
            setHasUploadError(false)
          }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Loading email compose credentials...</p>
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Icon icon="solar:danger-bold" className="text-danger mb-3" width="48" />
            <h5 className="fw-bold">No Active Mail Accounts Configured</h5>
            <p className="text-muted">You must configure and activate at least one cPanel mail account before composing messages.</p>
            <Button as={Link as any} href="/mail/accounts" variant="primary" size="sm">
              Go to Mail Accounts
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-transparent border-bottom py-3">
            <h5 className="mb-0 fw-bold">New Message</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">From Account *</Form.Label>
                    <Form.Select required value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
                      <option value="">-- Choose Mailbox --</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.fromName} &lt;{acc.emailAddress}&gt;
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">To *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Enter recipient email addresses (comma-separated for multiple)"
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Cc</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Comma-separated emails (optional)"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Bcc</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Comma-separated emails (optional)"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Subject *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Enter message subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Rich Text Editor */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Email Content *</Form.Label>
                <div style={{ minHeight: '340px' }}>
                  <ReactQuill
                    theme="snow"
                    value={bodyHtml}
                    onChange={setBodyHtml}
                    modules={TOOLBAR_MODULES}
                    formats={FORMATS}
                    style={{ height: '280px' }}
                  />
                </div>
              </Form.Group>

              {/* Template Integration wrapper */}
              <Row className="bg-light p-3 rounded mb-4 mx-0 align-items-center">
                <Col md={4} className="d-flex align-items-center mb-2 mb-md-0">
                  <Form.Check
                    type="switch"
                    id="useTemplateSwitch"
                    label="Wrap with centralized Email Layout"
                    checked={useTemplate}
                    onChange={(e) => setUseTemplate(e.target.checked)}
                  />
                </Col>
                <Col md={8}>
                  {useTemplate && (
                    <Form.Group className="mb-0">
                      <Form.Select value={selectedTemplateKey} onChange={(e) => setSelectedTemplateKey(e.target.value)}>
                        <option value="">-- Choose Active Template --</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.locale === 'bn' ? 'Bangla' : 'English'})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                </Col>
              </Row>

              {/* File uploads section */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Attachments</Form.Label>
                <div className="border border-dashed p-4 text-center rounded bg-white">
                  <Icon icon="solar:upload-minimalistic-linear" width="40" className="text-secondary mb-2" />
                  <div>
                    <Button variant="outline-primary" size="sm" disabled={uploadingFiles} style={{ position: 'relative', overflow: 'hidden' }}>
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
                    Allowed formats: PDF, image, doc/docx, xls/xlsx, zip. Maximum size: 15MB per file.
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
                <Button as={Link as any} href="/mail/inbox" variant="light" disabled={submitting || uploadingFiles}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting || uploadingFiles}>
                  {submitting ? 'Sending email...' : 'Send Message'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  )
}
