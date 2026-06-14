'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import { siteSettingsApi, type SiteSettings, type UpdateSiteSettingsDto } from '@/lib/api/site-settings.api'

const SECTION = {
  branding: 'Branding',
  contact: 'Contact',
  social: 'Social Media',
  messages: 'Public Messages',
} as const

type Section = keyof typeof SECTION

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<UpdateSiteSettingsDto>({})
  const [activeSection, setActiveSection] = useState<Section>('branding')

  useEffect(() => {
    siteSettingsApi.get()
      .then(s => {
        setSettings(s)
        setForm({
          siteName: s.siteName,
          siteTagline: s.siteTagline ?? '',
          organizationName: s.organizationName,
          officialPhone: s.officialPhone ?? '',
          supportPhone: s.supportPhone ?? '',
          supportEmail: s.supportEmail ?? '',
          officeAddress: s.officeAddress ?? '',
          primaryLogoUrl: s.primaryLogoUrl ?? '',
          secondaryLogoUrl: s.secondaryLogoUrl ?? '',
          faviconUrl: s.faviconUrl ?? '',
          defaultMetaTitle: s.defaultMetaTitle ?? '',
          defaultMetaDescription: s.defaultMetaDescription ?? '',
          facebookUrl: s.facebookUrl ?? '',
          youtubeUrl: s.youtubeUrl ?? '',
          linkedinUrl: s.linkedinUrl ?? '',
          registrationErrorTitle: s.registrationErrorTitle,
          registrationErrorMessage: s.registrationErrorMessage,
          emergencyNotice: s.emergencyNotice ?? '',
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load site settings.')
        setLoading(false)
      })
  }, [])

  function set(key: keyof UpdateSiteSettingsDto, value: string) {
    setForm(f => ({ ...f, [key]: value || null }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updated = await siteSettingsApi.update(form)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch {
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-fluid">
        <PageHeader title="Site Settings" breadcrumbs={[{ label: 'Settings' }, { label: 'Site Settings' }]} />
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    )
  }

  const f = (key: keyof UpdateSiteSettingsDto) => String(form[key] ?? '')

  return (
    <div className="container-fluid">
      <PageHeader
        title="Site Settings"
        breadcrumbs={[{ label: 'Settings' }, { label: 'Site Settings' }]}
      />

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {saved && <Alert variant="success" className="mb-3">Settings saved successfully.</Alert>}

      <Form onSubmit={handleSave}>
        <Row className="g-3">
          {/* ── Section tabs (left rail) ── */}
          <Col md={3} lg={2}>
            <Card>
              <Card.Body className="p-2">
                <div className="d-flex flex-column gap-1">
                  {(Object.keys(SECTION) as Section[]).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSection(key)}
                      className={`btn btn-sm text-start d-flex align-items-center gap-2 ${activeSection === key ? 'btn-primary' : 'btn-light'}`}
                    >
                      <Icon icon={
                        key === 'branding' ? 'solar:palette-bold-duotone' :
                        key === 'contact' ? 'solar:phone-bold-duotone' :
                        key === 'social' ? 'solar:share-bold-duotone' :
                        'solar:chat-square-bold-duotone'
                      } />
                      {SECTION[key]}
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* ── Fields (right panel) ── */}
          <Col md={9} lg={10}>
            <Card>
              <Card.Header className="fw-semibold d-flex align-items-center gap-2">
                <Icon icon={
                  activeSection === 'branding' ? 'solar:palette-bold-duotone' :
                  activeSection === 'contact' ? 'solar:phone-bold-duotone' :
                  activeSection === 'social' ? 'solar:share-bold-duotone' :
                  'solar:chat-square-bold-duotone'
                } />
                {SECTION[activeSection]}
              </Card.Header>
              <Card.Body>
                <Row className="g-3">

                  {/* ── BRANDING ── */}
                  {activeSection === 'branding' && (
                    <>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Site Name</Form.Label>
                          <Form.Control value={f('siteName')} onChange={e => set('siteName', e.target.value)} placeholder="Bangladesh Pet Association" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Organization Name</Form.Label>
                          <Form.Control value={f('organizationName')} onChange={e => set('organizationName', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Site Tagline</Form.Label>
                          <Form.Control value={f('siteTagline')} onChange={e => set('siteTagline', e.target.value)} placeholder="Caring for every pet, every life." />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Primary Logo URL</Form.Label>
                          <Form.Control type="url" value={f('primaryLogoUrl')} onChange={e => set('primaryLogoUrl', e.target.value)} placeholder="https://..." />
                          <Form.Text className="text-muted">
                            Paste a full URL from the Media Library (<a href="/media" target="_blank" rel="noopener noreferrer">open Media</a>).
                            Used in the website header and registration page. Leave blank to use the default BPA text badge.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Secondary Logo URL</Form.Label>
                          <Form.Control type="url" value={f('secondaryLogoUrl')} onChange={e => set('secondaryLogoUrl', e.target.value)} placeholder="https://..." />
                          <Form.Text className="text-muted">Used in footer or on dark backgrounds.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Favicon URL</Form.Label>
                          <Form.Control type="url" value={f('faviconUrl')} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://..." />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Default Meta Title</Form.Label>
                          <Form.Control value={f('defaultMetaTitle')} onChange={e => set('defaultMetaTitle', e.target.value)} placeholder="Bangladesh Pet Association — Official Site" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Default Meta Description</Form.Label>
                          <Form.Control as="textarea" rows={2} value={f('defaultMetaDescription')} onChange={e => set('defaultMetaDescription', e.target.value)} />
                        </Form.Group>
                      </Col>

                      {/* Logo previews */}
                      {(f('primaryLogoUrl') || f('secondaryLogoUrl')) && (
                        <Col md={12}>
                          <div className="d-flex flex-wrap gap-4 p-3 bg-light rounded border">
                            {f('primaryLogoUrl') && (
                              <div>
                                <p className="text-muted small mb-1">Primary Logo Preview</p>
                                <img src={f('primaryLogoUrl')} alt="Primary logo preview" style={{ maxHeight: 64, maxWidth: 220, objectFit: 'contain' }} />
                              </div>
                            )}
                            {f('secondaryLogoUrl') && (
                              <div className="bg-dark p-2 rounded">
                                <p className="text-white small mb-1">Secondary Logo Preview</p>
                                <img src={f('secondaryLogoUrl')} alt="Secondary logo preview" style={{ maxHeight: 64, maxWidth: 220, objectFit: 'contain' }} />
                              </div>
                            )}
                          </div>
                        </Col>
                      )}
                    </>
                  )}

                  {/* ── CONTACT ── */}
                  {activeSection === 'contact' && (
                    <>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Official Phone</Form.Label>
                          <Form.Control type="tel" value={f('officialPhone')} onChange={e => set('officialPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                          <Form.Text className="text-muted">Displayed in the website footer and contact page.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Support Phone <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="tel" value={f('supportPhone')} onChange={e => set('supportPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                          <Form.Text className="text-danger fw-semibold">
                            Shown to customers when online registration/payment is unavailable. Must be set for the call button to appear.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Support Email</Form.Label>
                          <Form.Control type="email" value={f('supportEmail')} onChange={e => set('supportEmail', e.target.value)} placeholder="support@bpa.org.bd" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Office Address</Form.Label>
                          <Form.Control as="textarea" rows={2} value={f('officeAddress')} onChange={e => set('officeAddress', e.target.value)} placeholder="House #, Road #, Area, Dhaka" />
                        </Form.Group>
                      </Col>
                    </>
                  )}

                  {/* ── SOCIAL ── */}
                  {activeSection === 'social' && (
                    <>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Facebook URL</Form.Label>
                          <Form.Control type="url" value={f('facebookUrl')} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/bpa" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>YouTube URL</Form.Label>
                          <Form.Control type="url" value={f('youtubeUrl')} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/@bpa" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>LinkedIn URL</Form.Label>
                          <Form.Control type="url" value={f('linkedinUrl')} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/company/bpa" />
                        </Form.Group>
                      </Col>
                    </>
                  )}

                  {/* ── PUBLIC MESSAGES ── */}
                  {activeSection === 'messages' && (
                    <>
                      <Col md={12}>
                        <Alert variant="info" className="py-2 text-sm">
                          <strong>Note:</strong> These messages are shown to customers on the public website when registration or payment is unavailable. Make sure the support phone (Contact tab) is set so the call button appears.
                        </Alert>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Registration Error Title</Form.Label>
                          <Form.Control
                            value={f('registrationErrorTitle')}
                            onChange={e => set('registrationErrorTitle', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Registration Error Message</Form.Label>
                          <Form.Control
                            as="textarea" rows={3}
                            value={f('registrationErrorMessage')}
                            onChange={e => set('registrationErrorMessage', e.target.value)}
                          />
                          <Form.Text className="text-muted">
                            Shown when the payment gateway is unavailable. Include instructions to call support.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Emergency Notice</Form.Label>
                          <Form.Control
                            as="textarea" rows={2}
                            value={f('emergencyNotice')}
                            onChange={e => set('emergencyNotice', e.target.value)}
                            placeholder="Leave blank to hide. Shown as a site-wide alert banner."
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving…</>
                ) : (
                  <><Icon icon="solar:diskette-bold-duotone" className="me-1" />Save Settings</>
                )}
              </Button>
              {settings && (
                <span className="text-muted small align-self-center">
                  Last saved: {new Date(settings.updatedAt as unknown as string).toLocaleString('en-GB')}
                </span>
              )}
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
