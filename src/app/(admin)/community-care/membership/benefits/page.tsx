'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBenefit, setEditBenefit] = useState<any>(null);
  const [form, setForm] = useState({ titleEn: '', titleBn: '', descriptionEn: '', descriptionBn: '', icon: '', sortOrder: 0, isActive: true, tierIds: [] as string[] });

  const fetch = useCallback(async () => {
    try {
      const [bRes, tRes] = await Promise.all([communityMembershipApi.listBenefits(), communityMembershipApi.listTiers()]);
      setBenefits(bRes.data ?? []);
      setTiers(tRes.data ?? []);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    try {
      if (editBenefit) await communityMembershipApi.updateBenefit(editBenefit.id, form);
      else await communityMembershipApi.createBenefit(form);
      setShowModal(false);
      fetch();
    } catch { alert('Failed'); }
  };

  const openEdit = (b: any) => {
    setEditBenefit(b);
    setForm({ titleEn: b.titleEn, titleBn: b.titleBn, descriptionEn: b.descriptionEn || '', descriptionBn: b.descriptionBn || '', icon: b.icon || '', sortOrder: b.sortOrder, isActive: b.isActive, tierIds: b.tierMappings?.map((m: any) => m.tierId) || [] });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <>
      <PageHeader title="Benefits" action={<Button variant="success" onClick={() => { setEditBenefit(null); setForm({ titleEn: '', titleBn: '', descriptionEn: '', descriptionBn: '', icon: '', sortOrder: 0, isActive: true, tierIds: [] }); setShowModal(true); }}>+ Add Benefit</Button>} />
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead><tr><th>#</th><th>Icon</th><th>Title (EN)</th><th>Title (BN)</th><th>Tiers</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {benefits.map((b: any, i: number) => (
                <tr key={b.id}>
                  <td>{i + 1}</td><td>{b.icon && <i className={b.icon} />}{b.icon}</td><td>{b.titleEn}</td><td>{b.titleBn}</td>
                  <td>{b.tierMappings?.map((m: any) => m.tier?.nameEn).join(', ') || '-'}</td>
                  <td><Badge bg={b.isActive ? 'success' : 'secondary'}>{b.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td>
                    <Button size="sm" variant="info" className="me-1" onClick={() => openEdit(b)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={async () => { await communityMembershipApi.deleteBenefit(b.id); fetch(); }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editBenefit ? 'Edit Benefit' : 'Add Benefit'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Description (EN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Description (BN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionBn} onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Icon</Form.Label><Form.Control value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Sort Order</Form.Label><Form.Control type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Active</Form.Label><Form.Check type="switch" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label>Assign to Tiers</Form.Label><div>{tiers.map((t: any) => (<Form.Check key={t.id} type="checkbox" label={t.nameEn} checked={form.tierIds.includes(t.id)} onChange={(e) => setForm({ ...form, tierIds: e.target.checked ? [...form.tierIds, t.id] : form.tierIds.filter((id) => id !== t.id) })} />))}</div></Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
