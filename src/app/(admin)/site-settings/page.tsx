'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { siteSettingsApi, type SiteSettings, type UpdateSiteSettingsDto } from '@/lib/api/site-settings.api'
import type { MediaFile } from '@/types/bpa.types'

const SECTION = {
  branding: 'Branding',
  contact: 'Contact & Address',
  social: 'Social Media',
  messages: 'Public Messages',
} as const

type Section = keyof typeof SECTION

// Fields that must be null (not '') when empty
const URL_FIELDS: (keyof UpdateSiteSettingsDto)[] = [
  'primaryLogoUrl', 'secondaryLogoUrl', 'faviconUrl',
  'facebookUrl', 'youtubeUrl', 'linkedinUrl', 'mapLink',
]
const NULLABLE_FIELDS: (keyof UpdateSiteSettingsDto)[] = [
  'siteTagline',
  'officialPhone', 'supportPhone', 'emergencyPhone', 'whatsappNumber',
  'generalEmail', 'supportEmail', 'officeHours',
  'officeAddress', 'addressLine1', 'addressLine2', 'area', 'city', 'postalCode', 'country',
  'mapEmbedUrl',
  'defaultMetaTitle', 'defaultMetaDescription', 'emergencyNotice',
]

function sanitizePayload(form: UpdateSiteSettingsDto): UpdateSiteSettingsDto {
  const payload = { ...form } as Record<string, unknown>
  for (const key of [...URL_FIELDS, ...NULLABLE_FIELDS]) {
    if (payload[key] === '') payload[key] = null
  }
  return payload as UpdateSiteSettingsDto
}

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
          // Identity
          siteName: s.siteName,
          siteTagline: s.siteTagline ?? '',
          organizationName: s.organizationName,
          // Contact
          officialPhone: s.officialPhone ?? '',
          supportPhone: s.supportPhone ?? '',
          emergencyPhone: s.emergencyPhone ?? '',
          whatsappNumber: s.whatsappNumber ?? '',
          generalEmail: s.generalEmail ?? '',
          supportEmail: s.supportEmail ?? '',
          officeHours: s.officeHours ?? '',
          // Address
          officeAddress: s.officeAddress ?? '',
          addressLine1: s.addressLine1 ?? '',
          addressLine2: s.addressLine2 ?? '',
          area: s.area ?? '',
          city: s.city ?? '',
          postalCode: s.postalCode ?? '',
          country: s.country ?? '',
          mapEmbedUrl: s.mapEmbedUrl ?? '',
          mapLink: s.mapLink ?? '',
          // Branding
          primaryLogoUrl: s.primaryLogoUrl ?? null,
          secondaryLogoUrl: s.secondaryLogoUrl ?? null,
          faviconUrl: s.faviconUrl ?? null,
          defaultMetaTitle: s.defaultMetaTitle ?? '',
          defaultMetaDescription: s.defaultMetaDescription ?? '',
          // Social
          facebookUrl: s.facebookUrl ?? '',
          youtubeUrl: s.youtubeUrl ?? '',
          linkedinUrl: s.linkedinUrl ?? '',
          // Messages
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

  function setUrl(key: keyof UpdateSiteSettingsDto) {
    return (_fileId: string | null, file: MediaFile | null) => {
      setForm(f => ({ ...f, [key]: file?.url ?? null }))
      setSaved(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updated = await siteSettingsApi.update(sanitizePayload(form))
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings. Please try again.')
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

      {error && <Alert variant="danger" className="mb-3" dismissible onClose={() => setError('')}>{error}</Alert>}
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
                        key === 'branding'  ? 'solar:palette-bold-duotone' :
                        key === 'contact'   ? 'solar:phone-bold-duotone' :
                        key === 'social'    ? 'solar:share-bold-duotone' :
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
                  activeSection === 'branding'  ? 'solar:palette-bold-duotone' :
                  activeSection === 'contact'   ? 'solar:phone-bold-duotone' :
                  activeSection === 'social'    ? 'solar:share-bold-duotone' :
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
                        <Alert variant="info" className="py-2 mb-0 small">
                          <Icon icon="solar:info-circle-bold-duotone" className="me-1" />
                          Upload images in <a href="/media" target="_blank" rel="noopener noreferrer">Media Library</a>, then select them here.
                        </Alert>
                      </Col>

                      <Col md={12}>
                        <MediaPickerInput
                          label="Primary Logo"
                          value={null}
                          previewUrl={form.primaryLogoUrl}
                          onChange={setUrl('primaryLogoUrl')}
                          dialogTitle="Select Primary Logo"
                          emptyLabel="Click to select logo from Media Library"
                          helpText="Used in website header and registration page. Leave blank for default BPA text badge."
                          mimeTypePrefix="image/"
                          accept="image/*"
                        />
                      </Col>
                      <Col md={6}>
                        <MediaPickerInput
                          label="Secondary Logo"
                          value={null}
                          previewUrl={form.secondaryLogoUrl}
                          onChange={setUrl('secondaryLogoUrl')}
                          dialogTitle="Select Secondary Logo"
                          emptyLabel="Click to select (for dark backgrounds)"
                          helpText="Used in footer and dark-background areas."
                          mimeTypePrefix="image/"
                          accept="image/*"
                        />
                      </Col>
                      <Col md={6}>
                        <MediaPickerInput
                          label="Favicon"
                          value={null}
                          previewUrl={form.faviconUrl}
                          onChange={setUrl('faviconUrl')}
                          dialogTitle="Select Favicon"
                          emptyLabel="Click to select favicon"
                          helpText="Prefer PNG, ICO, SVG, or WebP. Shown in browser tab."
                          mimeTypePrefix="image/"
                          accept="image/png,image/x-icon,image/svg+xml,image/webp"
                        />
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
                    </>
                  )}

                  {/* ── CONTACT & ADDRESS ── */}
                  {activeSection === 'contact' && (
                    <>
                      <Col md={12}>
                        <p className="text-muted small mb-0">
                          All fields are optional. Leave blank to hide that information from the public website. No placeholder data will be shown.
                        </p>
                      </Col>

                      {/* ─ Phone ─ */}
                      <Col md={12}>
                        <div className="fw-semibold text-muted small text-uppercase mb-1">Phone Numbers</div>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Official Phone</Form.Label>
                          <Form.Control type="tel" value={f('officialPhone')} onChange={e => set('officialPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                          <Form.Text className="text-muted">Shown in footer and contact page.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Support Phone</Form.Label>
                          <Form.Control type="tel" value={f('supportPhone')} onChange={e => set('supportPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                          <Form.Text className="text-danger fw-semibold">Shown when payment/registration is unavailable.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Emergency Phone</Form.Label>
                          <Form.Control type="tel" value={f('emergencyPhone')} onChange={e => set('emergencyPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                          <Form.Text className="text-muted">Animal rescue / emergency line.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>WhatsApp Number</Form.Label>
                          <Form.Control type="tel" value={f('whatsappNumber')} onChange={e => set('whatsappNumber', e.target.value)} placeholder="01XXXXXXXXX" />
                        </Form.Group>
                      </Col>

                      {/* ─ Email ─ */}
                      <Col md={12}>
                        <div className="fw-semibold text-muted small text-uppercase mb-1 mt-2">Email Addresses</div>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>General Email</Form.Label>
                          <Form.Control type="email" value={f('generalEmail')} onChange={e => set('generalEmail', e.target.value)} placeholder="info@bpa.org.bd" />
                          <Form.Text className="text-muted">Primary contact email shown publicly.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Support Email</Form.Label>
                          <Form.Control type="email" value={f('supportEmail')} onChange={e => set('supportEmail', e.target.value)} placeholder="support@bpa.org.bd" />
                        </Form.Group>
                      </Col>

                      {/* ─ Office Hours ─ */}
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Office Hours</Form.Label>
                          <Form.Control value={f('officeHours')} onChange={e => set('officeHours', e.target.value)} placeholder="Sun–Thu: 9 AM – 6 PM, Fri–Sat: Closed" />
                          <Form.Text className="text-muted">Shown on the contact page.</Form.Text>
                        </Form.Group>
                      </Col>

                      {/* ─ Address ─ */}
                      <Col md={12}>
                        <div className="fw-semibold text-muted small text-uppercase mb-1 mt-2">Office Address</div>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Address Line 1</Form.Label>
                          <Form.Control value={f('addressLine1')} onChange={e => set('addressLine1', e.target.value)} placeholder="House/Apt number, Street name" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Address Line 2</Form.Label>
                          <Form.Control value={f('addressLine2')} onChange={e => set('addressLine2', e.target.value)} placeholder="Building, Floor, etc." />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Area / Thana</Form.Label>
                          <Form.Control value={f('area')} onChange={e => set('area', e.target.value)} placeholder="Bashundhara R/A" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>City</Form.Label>
                          <Form.Control value={f('city')} onChange={e => set('city', e.target.value)} placeholder="Dhaka" />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Postal Code</Form.Label>
                          <Form.Control value={f('postalCode')} onChange={e => set('postalCode', e.target.value)} placeholder="1229" />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Country</Form.Label>
                          <Form.Control value={f('country')} onChange={e => set('country', e.target.value)} placeholder="Bangladesh" />
                        </Form.Group>
                      </Col>

                      {/* ─ Map ─ */}
                      <Col md={12}>
                        <div className="fw-semibold text-muted small text-uppercase mb-1 mt-2">Map</div>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Google Maps Link</Form.Label>
                          <Form.Control type="url" value={f('mapLink')} onChange={e => set('mapLink', e.target.value)} placeholder="https://maps.google.com/?q=..." />
                          <Form.Text className="text-muted">Used for "View on Google Maps" button on contact page.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Google Maps Embed URL</Form.Label>
                          <Form.Control as="textarea" rows={2} value={f('mapEmbedUrl')} onChange={e => set('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                          <Form.Text className="text-muted">If provided, an interactive embedded map will display on the contact page. Get this from Google Maps → Share → Embed a map → copy the src URL.</Form.Text>
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
