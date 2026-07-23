'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap'
import { communityMembershipApi } from '@/lib/api/community-membership.api'
import PageHeader from '@/components/ui/PageHeader'

const SERVICE_CATEGORIES = [
  'VACCINATION',
  'DEWORMING',
  'HEALTH_CHECKUP',
  'MICROCHIP',
  'LAB_TEST',
  'IMAGING',
  'GROOMING',
  'BOARDING',
  'TRAINING',
  'SURGERY',
  'EMERGENCY',
  'OTHER',
]

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [discounts, setDiscounts] = useState<any[]>([])
  const [tiers, setTiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSvcModal, setShowSvcModal] = useState(false)
  const [showDiscModal, setShowDiscModal] = useState(false)
  const [editSvc, setEditSvc] = useState<any>(null)
  const [svcForm, setSvcForm] = useState({ nameEn: '', nameBn: '', category: 'HEALTH_CHECKUP', basePriceBdt: 0, isActive: true, sortOrder: 0 })
  const [discForm, setDiscForm] = useState({ tierId: '', serviceId: '', discountType: 'PERCENTAGE', discountValue: 15 })

  const fetch = useCallback(async () => {
    try {
      const [svcRes, discRes, tierRes] = await Promise.all([
        communityMembershipApi.listServices(),
        communityMembershipApi.listDiscounts(),
        communityMembershipApi.listTiers(),
      ])
      setServices(svcRes ?? [])
      setDiscounts(discRes ?? [])
      setTiers(tierRes ?? [])
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleSaveSvc = async () => {
    try {
      if (editSvc) await communityMembershipApi.updateService(editSvc.id, svcForm)
      else await communityMembershipApi.createService(svcForm)
      setShowSvcModal(false)
      fetch()
    } catch {
      alert('Failed')
    }
  }

  const handleSaveDisc = async () => {
    try {
      await communityMembershipApi.upsertDiscount(discForm)
      setShowDiscModal(false)
      fetch()
    } catch {
      alert('Failed')
    }
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <PageHeader
        title={'Services & Discounts'.replace(/&/g, '&')}
        action={
          <Button
            variant="success"
            onClick={() => {
              setEditSvc(null)
              setSvcForm({ nameEn: '', nameBn: '', category: 'HEALTH_CHECKUP', basePriceBdt: 0, isActive: true, sortOrder: 0 })
              setShowSvcModal(true)
            }}>
            {'+ Add Service'}
          </Button>
        }
      />

      <Card className="mb-3">
        <Card.Header>
          <h5 className="mb-0">Services</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Name (EN)</th>
                <th>Name (BN)</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s: any, i: number) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.nameEn}</td>
                  <td>{s.nameBn}</td>
                  <td>
                    <Badge bg="info">{s.category}</Badge>
                  </td>
                  <td>
                    {'\u09F3'}
                    {Number(s.basePriceBdt).toLocaleString()}
                  </td>
                  <td>
                    <Badge bg={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      className="me-1"
                      onClick={() => {
                        setEditSvc(s)
                        setSvcForm({
                          nameEn: s.nameEn,
                          nameBn: s.nameBn,
                          category: s.category,
                          basePriceBdt: Number(s.basePriceBdt),
                          isActive: s.isActive,
                          sortOrder: s.sortOrder,
                        })
                        setShowSvcModal(true)
                      }}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        await communityMembershipApi.deleteService(s.id)
                        fetch()
                      }}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tier Discounts</h5>
          <Button
            size="sm"
            variant="success"
            onClick={() => {
              setDiscForm({ tierId: tiers[0]?.id || '', serviceId: services[0]?.id || '', discountType: 'PERCENTAGE', discountValue: 15 })
              setShowDiscModal(true)
            }}>
            {'+ Set Discount'}
          </Button>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Service</th>
                <th>Type</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d: any) => (
                <tr key={d.id}>
                  <td>{d.tier?.nameEn}</td>
                  <td>{d.service?.nameEn}</td>
                  <td>
                    <Badge bg="primary">{d.discountType}</Badge>
                  </td>
                  <td>{d.discountType === 'PERCENTAGE' ? `${d.discountValue}%` : `\u09F3${d.discountValue}`}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        await communityMembershipApi.deleteDiscount(d.id)
                        fetch()
                      }}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showSvcModal} onHide={() => setShowSvcModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editSvc ? 'Edit Service' : 'Add Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name (EN)</Form.Label>
                <Form.Control value={svcForm.nameEn} onChange={(e) => setSvcForm({ ...svcForm, nameEn: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name (BN)</Form.Label>
                <Form.Control value={svcForm.nameBn} onChange={(e) => setSvcForm({ ...svcForm, nameBn: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select value={svcForm.category} onChange={(e) => setSvcForm({ ...svcForm, category: e.target.value })}>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Base Price ({'\u09F3'})</Form.Label>
                <Form.Control
                  type="number"
                  value={svcForm.basePriceBdt}
                  onChange={(e) => setSvcForm({ ...svcForm, basePriceBdt: Number(e.target.value) })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Active</Form.Label>
                <Form.Check type="switch" checked={svcForm.isActive} onChange={(e) => setSvcForm({ ...svcForm, isActive: e.target.checked })} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSvcModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveSvc}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDiscModal} onHide={() => setShowDiscModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Discount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Tier</Form.Label>
            <Form.Select value={discForm.tierId} onChange={(e) => setDiscForm({ ...discForm, tierId: e.target.value })}>
              {tiers.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.nameEn}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Service</Form.Label>
            <Form.Select value={discForm.serviceId} onChange={(e) => setDiscForm({ ...discForm, serviceId: e.target.value })}>
              {services
                .filter((s: any) => s.isActive)
                .map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.nameEn}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select value={discForm.discountType} onChange={(e) => setDiscForm({ ...discForm, discountType: e.target.value })}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Value</Form.Label>
            <Form.Control
              type="number"
              value={discForm.discountValue}
              onChange={(e) => setDiscForm({ ...discForm, discountValue: Number(e.target.value) })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDiscModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveDisc}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
