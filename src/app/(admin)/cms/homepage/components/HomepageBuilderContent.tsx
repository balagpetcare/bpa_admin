'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge, Button, Card, Col, Form, InputGroup, Row, Tab, Tabs } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { homepageApi, type FooterDto, type HomepageSectionDto, type PartnerDto } from '@/lib/api/homepage.api'
import type { ApiError } from '@/lib/api'
import type { FooterLinkGroup, HomepageSection, HomepageSectionType, Partner } from '@/types/bpa.types'

const PRESETS: Array<{
  key: string
  type: HomepageSectionType
  title: string
  eyebrow: string
  subtitle: string
  source: 'manual' | 'automatic' | 'static'
}> = [
  { key: 'hero', type: 'hero', title: 'Hero Slider', eyebrow: 'Homepage', subtitle: 'Primary CMS-managed hero area.', source: 'automatic' },
  { key: 'stats', type: 'stats', title: 'Impact Metrics', eyebrow: 'Our Impact', subtitle: 'Membership, event, district, and community numbers.', source: 'manual' },
  { key: 'campaigns', type: 'campaigns', title: 'Featured Campaigns', eyebrow: 'Campaigns', subtitle: 'Vaccination and health campaigns selected from campaign CMS.', source: 'automatic' },
  { key: 'events', type: 'events', title: 'Upcoming Events', eyebrow: 'Events', subtitle: 'Upcoming public events from event CMS.', source: 'automatic' },
  { key: 'membership', type: 'custom', title: 'Membership', eyebrow: 'Join BPA', subtitle: 'Membership value proposition and conversion CTA.', source: 'static' },
  { key: 'volunteer', type: 'custom', title: 'Volunteer', eyebrow: 'Get Involved', subtitle: 'Volunteer recruitment content and CTA.', source: 'static' },
  { key: 'partners', type: 'partners', title: 'Partners & Supporters', eyebrow: 'Partners', subtitle: 'Organizations shown from partner CMS.', source: 'automatic' },
  { key: 'success_stories', type: 'custom', title: 'Success Stories', eyebrow: 'Stories', subtitle: 'Community proof and outcomes.', source: 'manual' },
  { key: 'news', type: 'news', title: 'Latest News', eyebrow: 'News', subtitle: 'Recent published news articles.', source: 'automatic' },
  { key: 'seo', type: 'custom', title: 'Homepage SEO', eyebrow: 'SEO', subtitle: 'Editorial metadata and schema notes.', source: 'static' },
  { key: 'footer', type: 'custom', title: 'Footer', eyebrow: 'Site Footer', subtitle: 'Footer content is managed in the Footer tab.', source: 'static' },
]

const DEFAULT_FOOTER_GROUPS: FooterLinkGroup[] = [
  {
    title: 'Organization',
    sortOrder: 0,
    isVisible: true,
    links: [
      { label: 'About BPA', href: '/about', target: '_self', sortOrder: 0, isVisible: true },
      { label: 'Mission & Vision', href: '/mission', target: '_self', sortOrder: 1, isVisible: true },
      { label: 'Committee', href: '/committee', target: '_self', sortOrder: 2, isVisible: true },
    ],
  },
  {
    title: 'Community',
    sortOrder: 1,
    isVisible: true,
    links: [
      { label: 'News', href: '/news', target: '_self', sortOrder: 0, isVisible: true },
      { label: 'Events', href: '/events', target: '_self', sortOrder: 1, isVisible: true },
      { label: 'Volunteer', href: '/volunteer', target: '_self', sortOrder: 2, isVisible: true },
    ],
  },
  {
    title: 'Members',
    sortOrder: 2,
    isVisible: true,
    links: [
      { label: 'Membership', href: '/membership', target: '_self', sortOrder: 0, isVisible: true },
      { label: 'Contact Us', href: '/contact', target: '_self', sortOrder: 1, isVisible: true },
    ],
  },
]

function sectionKey(section: HomepageSection) {
  return String(section.content?.key ?? section.type)
}

function toSectionDto(section: HomepageSection): HomepageSectionDto {
  return {
    type: section.type,
    source: section.source,
    title: section.title,
    eyebrow: section.eyebrow,
    subtitle: section.subtitle,
    body: section.body,
    ctaType: section.ctaType,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    ctaTarget: section.ctaTarget,
    itemLimit: section.itemLimit,
    content: section.content,
    isVisible: section.isVisible,
    sortOrder: section.sortOrder,
    startAt: section.startAt,
    endAt: section.endAt,
  }
}

export default function HomepageBuilderContent() {
  const { can } = usePermission()
  const [locale] = useState('en')
  const [activeTab, setActiveTab] = useState('sections')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [homepageDraft, setHomepageDraft] = useState<{ title?: string; description?: string }>({})
  const [partnerDraft, setPartnerDraft] = useState<PartnerDto>({ name: '', description: '', url: '', tier: '', isActive: true, sortOrder: 0 })
  const [footerDraft, setFooterDraft] = useState<FooterDto>({
    locale,
    brandName: 'Bangladesh Pet Association',
    brandText: 'Promoting responsible pet ownership and animal welfare across Bangladesh.',
    email: 'info@bpa.org.bd',
    phone: '',
    address: '',
    copyrightText: '',
    socialLinks: [],
    isActive: true,
    groups: DEFAULT_FOOTER_GROUPS,
  })

  const sectionsFn = useCallback(() => homepageApi.listSections({ locale, limit: 50 }), [locale])
  const homepageFn = useCallback(() => homepageApi.get(locale), [locale])
  const partnersFn = useCallback(() => homepageApi.listPartners({ limit: 50 }), [])
  const footerFn = useCallback(() => homepageApi.getFooter(locale), [locale])

  const sectionsState = useApi(sectionsFn, [locale])
  const homepageState = useApi(homepageFn, [locale])
  const partnersState = useApi(partnersFn, [])
  const footerState = useApi(footerFn, [locale])
  const mutation = useApiMutation<unknown, unknown>()

  const sections = useMemo(() => (sectionsState.data?.data ?? []).sort((a, b) => a.sortOrder - b.sortOrder), [sectionsState.data])
  const partners = partnersState.data?.data ?? []
  const selectedSection = sections.find((item) => item.id === selectedSectionId) ?? sections[0] ?? null

  const refresh = () => {
    sectionsState.refetch()
    homepageState.refetch()
    partnersState.refetch()
    footerState.refetch()
  }

  const createPresetSections = async () => {
    for (const [index, preset] of PRESETS.entries()) {
      if (sections.some((section) => sectionKey(section) === preset.key)) continue
      await homepageApi.createSection({
        locale,
        type: preset.type,
        source: preset.source,
        title: preset.title,
        eyebrow: preset.eyebrow,
        subtitle: preset.subtitle,
        body: '',
        ctaType: preset.key === 'membership' || preset.key === 'volunteer' ? 'internal' : 'none',
        ctaLabel: preset.key === 'membership' ? 'Become a Member' : preset.key === 'volunteer' ? 'Volunteer With Us' : null,
        ctaHref: preset.key === 'membership' ? '/membership' : preset.key === 'volunteer' ? '/volunteer' : null,
        ctaTarget: '_self',
        itemLimit: preset.key === 'stats' ? 4 : 3,
        isVisible: true,
        sortOrder: index,
        content: { key: preset.key },
      })
    }
    refresh()
  }

  const saveHomepage = async () => {
    const homepage = homepageState.data
    await mutation.mutate(
      () => homepageApi.update({
        locale,
        title: homepageDraft.title ?? homepage?.title ?? 'Bangladesh Pet Association',
        description: homepageDraft.description ?? homepage?.description ?? 'Caring for pets, building a community.',
        settings: homepage?.settings ?? {},
      }),
      undefined,
    )
    setHomepageDraft({})
    refresh()
  }

  const saveSection = async (section: HomepageSection, patch: Partial<HomepageSectionDto>) => {
    await mutation.mutate(() => homepageApi.updateSection(section.id, { ...toSectionDto(section), ...patch }), undefined)
    refresh()
  }

  const moveSection = async (section: HomepageSection, direction: -1 | 1) => {
    const index = sections.findIndex((item) => item.id === section.id)
    const swap = sections[index + direction]
    if (!swap) return
    const reordered = sections.map((item) => ({ id: item.id, sortOrder: item.id === section.id ? swap.sortOrder : item.id === swap.id ? section.sortOrder : item.sortOrder }))
    await mutation.mutate(() => homepageApi.reorderSections(locale, reordered), undefined)
    refresh()
  }

  const savePartner = async () => {
    if (!partnerDraft.name.trim()) return
    await mutation.mutate(() => homepageApi.createPartner(partnerDraft), undefined)
    setPartnerDraft({ name: '', description: '', url: '', tier: '', isActive: true, sortOrder: partners.length })
    refresh()
  }

  const togglePartner = async (partner: Partner) => {
    await mutation.mutate(() => homepageApi.updatePartner(partner.id, { isActive: !partner.isActive }), undefined)
    refresh()
  }

  const saveFooter = async () => {
    await mutation.mutate(() => homepageApi.upsertFooter(footerDraft), undefined)
    refresh()
  }

  const loadFooter = () => {
    const footer = footerState.data
    if (!footer) return
    setFooterDraft({
      locale,
      brandName: footer.brandName,
      brandText: footer.brandText,
      logoId: footer.logo?.id ?? null,
      email: footer.email,
      phone: footer.phone,
      address: footer.address,
      copyrightText: footer.copyrightText,
      socialLinks: footer.socialLinks ?? [],
      isActive: footer.isActive,
      groups: footer.groups.length ? footer.groups : DEFAULT_FOOTER_GROUPS,
    })
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Homepage CMS"
        breadcrumbs={[{ label: 'Content' }, { label: 'Homepage CMS' }]}
        action={(
          <div className="d-flex gap-2">
            <Link href="/cms/hero-slider" className="btn btn-outline-primary">
              <Icon icon="solar:slider-horizontal-bold-duotone" className="me-1" />
              Hero Slides
            </Link>
            {can('homepage:publish') && (
              <Button onClick={() => mutation.mutate(() => homepageApi.publish(locale), undefined)} disabled={mutation.loading}>
                <Icon icon="solar:upload-square-bold-duotone" className="me-1" />
                Publish
              </Button>
            )}
          </div>
        )}
      />

      <ApiErrorAlert error={(sectionsState.error || homepageState.error || partnersState.error || footerState.error || mutation.error) as ApiError | null} />

      <Row className="g-3 mb-3">
        <Col md={3}><Card><Card.Body><div className="text-muted small">Sections</div><h4 className="mb-0">{sections.length}</h4></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><div className="text-muted small">Visible</div><h4 className="mb-0">{sections.filter((s) => s.isVisible).length}</h4></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><div className="text-muted small">Partners</div><h4 className="mb-0">{partners.length}</h4></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><div className="text-muted small">Status</div><h4 className="mb-0 text-capitalize">{homepageState.data?.status ?? 'draft'}</h4></Card.Body></Card></Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key ?? 'sections')} className="mb-3">
        <Tab eventKey="sections" title="Sections">
          <Row className="g-3">
            <Col xl={4}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Homepage Order</h6>
                  <Button size="sm" variant="outline-primary" onClick={createPresetSections}>Add Defaults</Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`w-100 border-0 border-bottom bg-transparent text-start p-3 ${selectedSection?.id === section.id ? 'bg-light' : ''}`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <div className="d-flex justify-content-between gap-2">
                        <div>
                          <div className="fw-semibold">{section.title ?? section.type}</div>
                          <small className="text-muted text-capitalize">{sectionKey(section).replaceAll('_', ' ')}</small>
                        </div>
                        <Badge bg={section.isVisible ? 'success' : 'secondary'}>{section.isVisible ? 'Shown' : 'Hidden'}</Badge>
                      </div>
                    </button>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col xl={8}>
              {selectedSection ? (
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Edit Section</h6>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant="outline-secondary" onClick={() => moveSection(selectedSection, -1)}><Icon icon="solar:arrow-up-bold" /></Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => moveSection(selectedSection, 1)}><Icon icon="solar:arrow-down-bold" /></Button>
                      <Button size="sm" variant={selectedSection.isVisible ? 'outline-warning' : 'outline-success'} onClick={() => saveSection(selectedSection, { isVisible: !selectedSection.isVisible })}>
                        {selectedSection.isVisible ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Eyebrow</Form.Label>
                          <Form.Control value={selectedSection.eyebrow ?? ''} onChange={(e) => saveSection(selectedSection, { eyebrow: e.target.value })} />
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label>Title</Form.Label>
                          <Form.Control value={selectedSection.title ?? ''} onChange={(e) => saveSection(selectedSection, { title: e.target.value })} />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Subtitle</Form.Label>
                          <Form.Control as="textarea" rows={2} value={selectedSection.subtitle ?? ''} onChange={(e) => saveSection(selectedSection, { subtitle: e.target.value })} />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Body / Editorial Notes</Form.Label>
                          <Form.Control as="textarea" rows={4} value={selectedSection.body ?? ''} onChange={(e) => saveSection(selectedSection, { body: e.target.value })} />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Source</Form.Label>
                          <Form.Select value={selectedSection.source} onChange={(e) => saveSection(selectedSection, { source: e.target.value as HomepageSectionDto['source'] })}>
                            <option value="static">Static</option>
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Item Limit</Form.Label>
                          <Form.Control type="number" min={0} max={24} value={selectedSection.itemLimit} onChange={(e) => saveSection(selectedSection, { itemLimit: Number(e.target.value) })} />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>CTA Label</Form.Label>
                          <Form.Control value={selectedSection.ctaLabel ?? ''} onChange={(e) => saveSection(selectedSection, { ctaType: e.target.value ? 'internal' : 'none', ctaLabel: e.target.value })} />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>CTA Href</Form.Label>
                          <Form.Control value={selectedSection.ctaHref ?? ''} onChange={(e) => saveSection(selectedSection, { ctaHref: e.target.value })} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ) : (
                <Card><Card.Body className="text-center text-muted py-5">Add default sections to start editing the homepage.</Card.Body></Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="seo" title="SEO & Settings">
          <Card>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Homepage Title</Form.Label>
                    <Form.Control
                      value={homepageDraft.title ?? homepageState.data?.title ?? ''}
                      onChange={(e) => setHomepageDraft((draft) => ({ ...draft, title: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Button onClick={saveHomepage}>Save Settings</Button>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Meta Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={homepageDraft.description ?? homepageState.data?.description ?? ''}
                      onChange={(e) => setHomepageDraft((draft) => ({ ...draft, description: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="partners" title="Partners">
          <Row className="g-3">
            <Col lg={5}>
              <Card>
                <Card.Header><h6 className="mb-0">Add Partner</h6></Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={12}><Form.Control placeholder="Partner name" value={partnerDraft.name} onChange={(e) => setPartnerDraft((p) => ({ ...p, name: e.target.value }))} /></Col>
                    <Col md={12}><Form.Control placeholder="Website URL" value={partnerDraft.url ?? ''} onChange={(e) => setPartnerDraft((p) => ({ ...p, url: e.target.value }))} /></Col>
                    <Col md={12}><Form.Control as="textarea" rows={3} placeholder="Description" value={partnerDraft.description ?? ''} onChange={(e) => setPartnerDraft((p) => ({ ...p, description: e.target.value }))} /></Col>
                    <Col md={12}>
                      <MediaPickerInput
                        label="Logo"
                        value={partnerDraft.logoId}
                        onChange={(id) => setPartnerDraft((p) => ({ ...p, logoId: id }))}
                        emptyLabel="Select logo"
                      />
                    </Col>
                    <Col md={12}><Button onClick={savePartner} disabled={!partnerDraft.name.trim()}>Save Partner</Button></Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={7}>
              <Card>
                <Card.Header><h6 className="mb-0">Partner Directory</h6></Card.Header>
                <Card.Body className="p-0">
                  {partners.map((partner) => (
                    <div key={partner.id} className="d-flex justify-content-between align-items-center border-bottom p-3">
                      <div>
                        <div className="fw-semibold">{partner.name}</div>
                        <small className="text-muted">{partner.url || 'No URL'}</small>
                      </div>
                      <Button size="sm" variant={partner.isActive ? 'outline-warning' : 'outline-success'} onClick={() => togglePartner(partner)}>
                        {partner.isActive ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="footer" title="Footer">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Footer Settings</h6>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={loadFooter}>Load Current</Button>
                <Button onClick={saveFooter}>Save Footer</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}><Form.Control placeholder="Brand name" value={footerDraft.brandName ?? ''} onChange={(e) => setFooterDraft((f) => ({ ...f, brandName: e.target.value }))} /></Col>
                <Col md={6}><Form.Control placeholder="Email" value={footerDraft.email ?? ''} onChange={(e) => setFooterDraft((f) => ({ ...f, email: e.target.value }))} /></Col>
                <Col md={12}><Form.Control as="textarea" rows={3} placeholder="Brand text" value={footerDraft.brandText ?? ''} onChange={(e) => setFooterDraft((f) => ({ ...f, brandText: e.target.value }))} /></Col>
                <Col md={12}>
                  <InputGroup>
                    <InputGroup.Text>Copyright</InputGroup.Text>
                    <Form.Control value={footerDraft.copyrightText ?? ''} onChange={(e) => setFooterDraft((f) => ({ ...f, copyrightText: e.target.value }))} />
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}
