'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge, Table, Tabs, Tab } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { emailLayoutsApi, type EmailLayoutSetting, type CreateEmailLayoutDto } from '@/lib/api/email-layouts.api'

export default function EmailLayoutsPage() {
  const [layouts, setLayouts] = useState<EmailLayoutSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // List vs Edit vs Create Views
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [form, setForm] = useState<CreateEmailLayoutDto>({
    name: '',
    locale: 'en',
    status: 'active',
    isDefault: false,
    headerTitle: 'Bangladesh Pet Association',
    headerSubtitle: 'A national platform for responsible pet care',
    headerBackgroundColor: '#1a2540',
    headerTextColor: '#ffffff',
    headerLogoUrl: '',
    footerText: 'Bangladesh Pet Association',
    footerSupportEmail: 'vaccination2026@bangladeshpetassociation.com',
    footerPhonePrimary: '01575-008300',
    footerPhoneSecondary: '01701-022274',
    footerWebsiteUrl: 'https://bangladeshpetassociation.com',
    footerAddress: 'Dhaka, Bangladesh',
    footerBackgroundColor: '#1a2540',
    footerTextColor: '#aabbcc',
    footerLogoUrl: '',
    buttonPrimaryColor: '#1a6b3c',
    buttonTextColor: '#ffffff',
    legalNote: 'You are receiving this email because you interacted with Bangladesh Pet Association services.',
    customHeaderHtml: '',
    customFooterHtml: '',
  })

  // Live Preview HTML state
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  
  // Send test email state
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  // Fetch layouts on load
  const loadLayouts = async () => {
    setLoading(true)
    try {
      const data = await emailLayoutsApi.list()
      setLayouts(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load email layouts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLayouts()
  }, [])

  // Update live preview whenever form changes
  useEffect(() => {
    if (view === 'list') return

    const fetchPreview = async () => {
      setPreviewLoading(true)
      try {
        const payload = {
          layoutData: form,
          locale: form.locale,
          subject: 'Sample Transactional Notification',
          bodyHtml: `
            <h3 style="color: #1e293b; margin: 0 0 12px 0;">Booking Receipt &amp; Details</h3>
            <p>Dear Customer,</p>
            <p>Your vaccination campaign session booking has been successfully registered. Please verify your details below:</p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0; border: 1px solid #cbd5e1; border-radius: 6px; border-collapse: collapse; overflow: hidden;">
              <tr bgcolor="#f8fafc">
                <td style="padding: 10px 12px; font-weight: bold; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; width: 40%;">Item</td>
                <td style="padding: 10px 12px; font-weight: bold; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Details</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 12px; font-size: 13px; color: #64748b;">Booking ID</td>
                <td style="padding: 10px 12px; font-size: 13px; font-weight: bold; color: #0f172a;">BPA-2026-9842</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 12px; font-size: 13px; color: #64748b;">Vaccine Type</td>
                <td style="padding: 10px 12px; font-size: 13px; color: #0f172a;">Rabies &amp; DHPPi Combo</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-size: 13px; color: #64748b;">Amount Paid</td>
                <td style="padding: 10px 12px; font-size: 13px; font-weight: bold; color: #16a34a;">৳1,200 (SUCCESS)</td>
              </tr>
            </table>
            <div style="margin: 24px 0; text-align: center;">
              <a href="#" style="display: inline-block; background-color: ${form.buttonPrimaryColor}; color: ${form.buttonTextColor}; font-family: sans-serif; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                Download Digital Card
              </a>
            </div>
            <div style="padding: 12px; border-left: 4px solid #f59e0b; background-color: #fffbeb; font-size: 12px; color: #78350f; border-radius: 4px;">
              <strong>Note:</strong> Please arrive 15 minutes before your scheduled appointment block with your pet's vaccination card if available.
            </div>
          `,
          previewText: 'Your BPA booking is confirmed! View receipt & tickets inside.'
        }
        const res = await emailLayoutsApi.preview(payload)
        setPreviewHtml(res.html)
      } catch (err) {
        console.error('Failed to generate preview', err)
      } finally {
        setPreviewLoading(false)
      }
    }

    const timer = setTimeout(fetchPreview, 600)
    return () => clearTimeout(timer)
  }, [form, view])

  const handleInputChange = (key: keyof CreateEmailLayoutDto, value: any) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setForm({
      name: '',
      locale: 'en',
      status: 'active',
      isDefault: false,
      headerTitle: 'Bangladesh Pet Association',
      headerSubtitle: 'A national platform for responsible pet care',
      headerBackgroundColor: '#1a2540',
      headerTextColor: '#ffffff',
      headerLogoUrl: '',
      footerText: 'Bangladesh Pet Association',
      footerSupportEmail: 'vaccination2026@bangladeshpetassociation.com',
      footerPhonePrimary: '01575-008300',
      footerPhoneSecondary: '01701-022274',
      footerWebsiteUrl: 'https://bangladeshpetassociation.com',
      footerAddress: 'Dhaka, Bangladesh',
      footerBackgroundColor: '#1a2540',
      footerTextColor: '#aabbcc',
      footerLogoUrl: '',
      buttonPrimaryColor: '#1a6b3c',
      buttonTextColor: '#ffffff',
      legalNote: 'You are receiving this email because you interacted with Bangladesh Pet Association services.',
      customHeaderHtml: '',
      customFooterHtml: '',
    })
    setAdvancedMode(false)
    setError('')
    setSuccess('')
    setView('create')
  }

  const handleEdit = (layout: EmailLayoutSetting) => {
    setEditingId(layout.id)
    setForm({
      name: layout.name,
      locale: layout.locale,
      status: layout.status,
      isDefault: layout.isDefault,
      headerTitle: layout.headerTitle,
      headerSubtitle: layout.headerSubtitle || '',
      headerBackgroundColor: layout.headerBackgroundColor,
      headerTextColor: layout.headerTextColor,
      headerLogoUrl: layout.headerLogoUrl || '',
      footerText: layout.footerText || '',
      footerSupportEmail: layout.footerSupportEmail || '',
      footerPhonePrimary: layout.footerPhonePrimary || '',
      footerPhoneSecondary: layout.footerPhoneSecondary || '',
      footerWebsiteUrl: layout.footerWebsiteUrl || '',
      footerAddress: layout.footerAddress || '',
      footerBackgroundColor: layout.footerBackgroundColor,
      footerTextColor: layout.footerTextColor,
      footerLogoUrl: layout.footerLogoUrl || '',
      buttonPrimaryColor: layout.buttonPrimaryColor,
      buttonTextColor: layout.buttonTextColor,
      legalNote: layout.legalNote || '',
      customHeaderHtml: layout.customHeaderHtml || '',
      customFooterHtml: layout.customFooterHtml || '',
    })
    setAdvancedMode(!!(layout.customHeaderHtml || layout.customFooterHtml))
    setError('')
    setSuccess('')
    setView('edit')
  }

  const handleSetDefault = async (id: string) => {
    setError('')
    setSuccess('')
    try {
      await emailLayoutsApi.setDefault(id)
      setSuccess('Layout set as default successfully.')
      loadLayouts()
    } catch (err: any) {
      setError(err?.message || 'Failed to update default layout.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload: CreateEmailLayoutDto = { ...form }
      if (!advancedMode) {
        payload.customHeaderHtml = null
        payload.customFooterHtml = null
      }

      if (view === 'create') {
        await emailLayoutsApi.create(payload)
        setSuccess('Email layout created successfully!')
      } else if (view === 'edit' && editingId) {
        await emailLayoutsApi.update(editingId, payload)
        setSuccess('Email layout updated successfully!')
      }
      setView('list')
      loadLayouts()
    } catch (err: any) {
      setError(err?.message || 'Failed to save layout. Please check validation requirements (e.g. valid Hex colors).')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail) return
    
    setSendingTest(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        email: testEmail,
        layoutId: editingId,
        layoutData: editingId ? undefined : form,
        locale: form.locale
      }
      await emailLayoutsApi.sendTest(payload)
      setSuccess(`Test email sent successfully to ${testEmail}!`)
    } catch (err: any) {
      setError(err?.message || 'Failed to send test email.')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader 
        title="Email Layout Templates" 
        breadcrumbs={[{ label: 'Settings' }, { label: 'Email Layouts' }]}
      />

      {error && <Alert variant="danger" className="mb-3" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" className="mb-3" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* ─── LIST VIEW ─── */}
      {view === 'list' && (
        <Card className="shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0 py-3">
            <span className="fw-bold text-secondary-emphasis">Layout Config List</span>
            <Button variant="primary" size="sm" onClick={handleCreateNew} className="d-flex align-items-center gap-1">
              <Icon icon="solar:add-circle-bold" /> Create Layout
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
              </div>
            ) : layouts.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Icon icon="solar:letter-opened-broken" width={48} height={48} className="mb-2" />
                <p>No email layouts found. Create your first email layout setting!</p>
              </div>
            ) : (
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Locale</th>
                    <th>Status</th>
                    <th>Default Layout</th>
                    <th>Colors</th>
                    <th>Updated At</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {layouts.map(layout => (
                    <tr key={layout.id}>
                      <td className="fw-semibold">{layout.name}</td>
                      <td>
                        <Badge bg={layout.locale === 'en' ? 'info' : 'warning'} className="text-uppercase">
                          {layout.locale}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={layout.status === 'active' ? 'success' : 'secondary'}>
                          {layout.status}
                        </Badge>
                      </td>
                      <td>
                        {layout.isDefault ? (
                          <Badge bg="primary" className="d-inline-flex align-items-center gap-1">
                            <Icon icon="solar:check-circle-bold" /> Default Active
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleSetDefault(layout.id)}
                            disabled={layout.status !== 'active'}
                          >
                            Set Default
                          </Button>
                        )}
                      </td>
                      <td>
                        <span className="d-inline-flex gap-1">
                          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: layout.headerBackgroundColor, border: '1px solid #ccc' }} title="Header Bg" />
                          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: layout.buttonPrimaryColor, border: '1px solid #ccc' }} title="Button" />
                          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: layout.footerBackgroundColor, border: '1px solid #ccc' }} title="Footer Bg" />
                        </span>
                      </td>
                      <td className="small text-muted">{new Date(layout.updatedAt).toLocaleString()}</td>
                      <td className="text-end pe-4">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(layout)} className="me-1">
                          <Icon icon="solar:pen-bold" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ─── CREATE & EDIT VIEWS ─── */}
      {view !== 'list' && (
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Editor Controls */}
            <Col lg={7}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white border-bottom-0 d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold text-secondary-emphasis">
                    {view === 'create' ? 'Create Email Layout' : 'Edit Email Layout'}
                  </span>
                  <Button variant="light" size="sm" onClick={() => setView('list')} className="d-flex align-items-center gap-1">
                    <Icon icon="solar:arrow-left-bold" /> Back
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Tabs defaultActiveKey="identity" id="layout-editor-tabs" className="mb-3">
                    {/* tab 1: Identity & Status */}
                    <Tab eventKey="identity" title="General Settings">
                      <Row className="g-3 pt-2">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Layout Name</Form.Label>
                            <Form.Control 
                              value={form.name} 
                              onChange={e => handleInputChange('name', e.target.value)} 
                              required 
                              placeholder="e.g. Primary English Layout, Holiday Theme Layout"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Locale Language</Form.Label>
                            <Form.Select 
                              value={form.locale} 
                              onChange={e => handleInputChange('locale', e.target.value)}
                            >
                              <option value="en">English (en)</option>
                              <option value="bn">Bangla (bn)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Status</Form.Label>
                            <Form.Select 
                              value={form.status} 
                              onChange={e => handleInputChange('status', e.target.value)}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={12} className="mt-4">
                          <Form.Check 
                            type="checkbox"
                            id="layout-is-default"
                            label="Set as default active layout for this locale"
                            checked={form.isDefault}
                            onChange={e => handleInputChange('isDefault', e.target.checked)}
                            className="fw-semibold"
                          />
                          <Form.Text className="text-muted block mt-1">
                            Enabling this will automatically disable any other default active layout for the same locale.
                          </Form.Text>
                        </Col>
                      </Row>
                    </Tab>

                    {/* tab 2: Header Configuration */}
                    <Tab eventKey="header" title="Header Configuration">
                      <Row className="g-3 pt-2">
                        <Col md={12}>
                          <MediaPickerInput
                            label="Header Logo"
                            value={null}
                            previewUrl={form.headerLogoUrl}
                            onChange={(_id, file) => handleInputChange('headerLogoUrl', file?.url || '')}
                            dialogTitle="Select Header Logo"
                            emptyLabel="Click to select logo from Media Library"
                            helpText="Upload in Media Library first. Localhost image URLs will not be sent."
                            mimeTypePrefix="image/"
                            accept="image/*"
                          />
                          {form.headerLogoUrl && (
                            <div className="mt-2 p-2 border rounded bg-light d-inline-block">
                              <span className="small text-muted d-block mb-1">Logo Preview:</span>
                              <img src={form.headerLogoUrl} alt="Header Logo Preview" style={{ maxHeight: 50 }} />
                            </div>
                          )}
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Header Title</Form.Label>
                            <Form.Control 
                              value={form.headerTitle} 
                              onChange={e => handleInputChange('headerTitle', e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Header Subtitle (Optional)</Form.Label>
                            <Form.Control 
                              value={form.headerSubtitle || ''} 
                              onChange={e => handleInputChange('headerSubtitle', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Tab>

                    {/* tab 3: Footer Configuration */}
                    <Tab eventKey="footer" title="Footer Configuration">
                      <Row className="g-3 pt-2">
                        <Col md={12}>
                          <MediaPickerInput
                            label="Footer Logo"
                            value={null}
                            previewUrl={form.footerLogoUrl}
                            onChange={(_id, file) => handleInputChange('footerLogoUrl', file?.url || '')}
                            dialogTitle="Select Footer Logo"
                            emptyLabel="Click to select footer logo from Media Library"
                            mimeTypePrefix="image/"
                            accept="image/*"
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Support Email</Form.Label>
                            <Form.Control 
                              type="email"
                              value={form.footerSupportEmail || ''} 
                              onChange={e => handleInputChange('footerSupportEmail', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Website URL</Form.Label>
                            <Form.Control 
                              type="url"
                              value={form.footerWebsiteUrl || ''} 
                              onChange={e => handleInputChange('footerWebsiteUrl', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Primary Helpline Phone</Form.Label>
                            <Form.Control 
                              value={form.footerPhonePrimary || ''} 
                              onChange={e => handleInputChange('footerPhonePrimary', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Secondary Helpline Phone</Form.Label>
                            <Form.Control 
                              value={form.footerPhoneSecondary || ''} 
                              onChange={e => handleInputChange('footerPhoneSecondary', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Physical Address</Form.Label>
                            <Form.Control 
                              value={form.footerAddress || ''} 
                              onChange={e => handleInputChange('footerAddress', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Footer Text / Brand Tagline</Form.Label>
                            <Form.Control 
                              value={form.footerText || ''} 
                              onChange={e => handleInputChange('footerText', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Legal Note / Privacy Footer</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={2}
                              value={form.legalNote || ''} 
                              onChange={e => handleInputChange('legalNote', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Tab>

                    {/* tab 4: Color Styling */}
                    <Tab eventKey="colors" title="Color Styling">
                      <Row className="g-3 pt-2">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-block">Header Background Color</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control 
                                type="color" 
                                value={form.headerBackgroundColor} 
                                onChange={e => handleInputChange('headerBackgroundColor', e.target.value)}
                                style={{ width: 50, padding: 0 }}
                              />
                              <Form.Control 
                                value={form.headerBackgroundColor} 
                                onChange={e => handleInputChange('headerBackgroundColor', e.target.value)}
                                placeholder="#1a2540"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-block">Header Text Color</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control 
                                type="color" 
                                value={form.headerTextColor} 
                                onChange={e => handleInputChange('headerTextColor', e.target.value)}
                                style={{ width: 50, padding: 0 }}
                              />
                              <Form.Control 
                                value={form.headerTextColor} 
                                onChange={e => handleInputChange('headerTextColor', e.target.value)}
                                placeholder="#ffffff"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-block">Button Primary Color</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control 
                                type="color" 
                                value={form.buttonPrimaryColor} 
                                onChange={e => handleInputChange('buttonPrimaryColor', e.target.value)}
                                style={{ width: 50, padding: 0 }}
                              />
                              <Form.Control 
                                value={form.buttonPrimaryColor} 
                                onChange={e => handleInputChange('buttonPrimaryColor', e.target.value)}
                                placeholder="#1a6b3c"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-block">Button Text Color</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control 
                                type="color" 
                                value={form.buttonTextColor} 
                                onChange={e => handleInputChange('buttonTextColor', e.target.value)}
                                style={{ width: 50, padding: 0 }}
                              />
                              <Form.Control 
                                value={form.buttonTextColor} 
                                onChange={e => handleInputChange('buttonTextColor', e.target.value)}
                                placeholder="#ffffff"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-block">Footer Background Color</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control 
                                type="color" 
                                value={form.footerBackgroundColor} 
                                onChange={e => handleInputChange('footerBackgroundColor', e.target.value)}
                                style={{ width: 50, padding: 0 }}
                              />
                              <Form.Control 
                                value={form.footerBackgroundColor} 
                                onChange={e => handleInputChange('footerBackgroundColor', e.target.value)}
                                placeholder="#1a2540"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-block">Footer Text Color</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control 
                                type="color" 
                                value={form.footerTextColor} 
                                onChange={e => handleInputChange('footerTextColor', e.target.value)}
                                style={{ width: 50, padding: 0 }}
                              />
                              <Form.Control 
                                value={form.footerTextColor} 
                                onChange={e => handleInputChange('footerTextColor', e.target.value)}
                                placeholder="#aabbcc"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Tab>

                    {/* tab 5: Advanced HTML */}
                    <Tab eventKey="advanced" title="Advanced Layout">
                      <Row className="g-3 pt-2">
                        <Col md={12}>
                          <Form.Check 
                            type="switch"
                            id="layout-advanced-switch"
                            label="Enable custom HTML header/footer mode"
                            checked={advancedMode}
                            onChange={e => setAdvancedMode(e.target.checked)}
                            className="fw-bold mb-3"
                          />
                          <Alert variant="warning" className="small py-2">
                            <Icon icon="solar:info-circle-bold-duotone" className="me-1" />
                            If enabled, standard header and footer fields above will be ignored. The email client safe structure must be preserved. Do not include external JS or tailwind CSS. Script tags will be sanitized out automatically.
                          </Alert>
                        </Col>
                        {advancedMode && (
                          <>
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Custom Header HTML</Form.Label>
                                <Form.Control 
                                  as="textarea"
                                  rows={8}
                                  value={form.customHeaderHtml || ''} 
                                  onChange={e => handleInputChange('customHeaderHtml', e.target.value)}
                                  placeholder="<tr><td bgcolor='#1a2540' style='padding:32px;text-align:center;'>...</td></tr>"
                                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Custom Footer HTML</Form.Label>
                                <Form.Control 
                                  as="textarea"
                                  rows={8}
                                  value={form.customFooterHtml || ''} 
                                  onChange={e => handleInputChange('customFooterHtml', e.target.value)}
                                  placeholder="<tr><td bgcolor='#1a2540' style='padding:32px;color:#abbcc;'>...</td></tr>"
                                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                                />
                              </Form.Group>
                            </Col>
                          </>
                        )}
                      </Row>
                    </Tab>
                  </Tabs>
                </Card.Body>
                
                {/* Form Buttons */}
                <Card.Footer className="bg-white py-3 border-top-0 d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => setView('list')}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Settings'}
                  </Button>
                </Card.Footer>
              </Card>

              {/* Send Test Panel */}
              <Card className="shadow-sm mt-3">
                <Card.Header className="bg-white fw-bold">Test Email Sender</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSendTest}>
                    <Row className="g-2 align-items-end">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Send a test email using current unsaved edits</Form.Label>
                          <Form.Control 
                            type="email" 
                            placeholder="recipient@example.com" 
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Button 
                          variant="secondary" 
                          type="submit" 
                          disabled={sendingTest || !testEmail}
                          className="w-100 d-flex align-items-center justify-content-center gap-1"
                        >
                          {sendingTest ? 'Sending...' : <><Icon icon="solar:plain-bold" /> Send Test</>}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Live Preview Display (right rail) */}
            <Col lg={5}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center py-3">
                  <span>Live Render Preview</span>
                  {previewLoading && <div className="spinner-border spinner-border-sm text-primary" />}
                </Card.Header>
                <Card.Body className="p-0 bg-light" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                  {previewHtml ? (
                    <iframe 
                      title="Email Live Preview"
                      srcDoc={previewHtml}
                      style={{ flex: 1, border: 'none', width: '100%', height: '100%', minHeight: '580px' }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 flex-1 py-5 text-muted">
                      Initializing live preview render...
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  )
}
