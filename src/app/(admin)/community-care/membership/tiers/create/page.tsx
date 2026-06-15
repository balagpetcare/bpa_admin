'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function CreateTierPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nameEn: '', nameBn: '', slug: 'primary',
    launchPriceBdt: 3000, regularPriceBdt: 10000,
    petLimitMin: 1, petLimitMax: 3, validityMonths: 60,
    badgeTextEn: '', badgeTextBn: '',
    shortDescEn: '', shortDescBn: '',
    fullDescEn: '', fullDescBn: '',
    cardTheme: 'primary', isActive: true, sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await communityMembershipApi.createTier({ ...form, launchPriceBdt: Number(form.launchPriceBdt), regularPriceBdt: Number(form.regularPriceBdt) });
      router.push('/community-care/membership/tiers');
    } catch { alert('Failed to create tier'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title="Create Tier" breadcrumbs={[{ label: 'Tiers & Pricing', href: '/community-care/membership/tiers' }, { label: 'Create' }]} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Name (EN)</Form.Label><Form.Control value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Name (BN)</Form.Label><Form.Control value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Slug</Form.Label><Form.Select value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}><option value="primary">Primary</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></Form.Select></Form.Group></Col>
              <Col md={4}><Form.Group>
                <Form.Label>Launch Offer Price (৳)</Form.Label>
                <Form.Control type="number" value={form.launchPriceBdt} onChange={(e) => setForm({ ...form, launchPriceBdt: Number(e.target.value) })} />
              </Form.Group></Col>
              <Col md={4}><Form.Group>
                <Form.Label>Regular Price (৳)</Form.Label>
                <Form.Control type="number" value={form.regularPriceBdt} onChange={(e) => setForm({ ...form, regularPriceBdt: Number(e.target.value) })} />
              </Form.Group></Col>
              <Col md={12}><hr /><h6 className="text-(--bpa-navy)">Pricing &amp; Validity</h6></Col>
              <Col md={3}><Form.Group>
                <Form.Label>Validity (Months) <span className="text-muted fw-normal">— 60 = 5 years</span></Form.Label>
                <Form.Control type="number" value={form.validityMonths} onChange={(e) => setForm({ ...form, validityMonths: Number(e.target.value) })} />
              </Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Pet Min</Form.Label><Form.Control type="number" value={form.petLimitMin} onChange={(e) => setForm({ ...form, petLimitMin: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Pet Max</Form.Label><Form.Control type="number" value={form.petLimitMax} onChange={(e) => setForm({ ...form, petLimitMax: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Sort Order</Form.Label><Form.Control type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Badge Text (EN)</Form.Label><Form.Control value={form.badgeTextEn} onChange={(e) => setForm({ ...form, badgeTextEn: e.target.value })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Badge Text (BN)</Form.Label><Form.Control value={form.badgeTextBn} onChange={(e) => setForm({ ...form, badgeTextBn: e.target.value })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Card Theme</Form.Label><Form.Select value={form.cardTheme} onChange={(e) => setForm({ ...form, cardTheme: e.target.value })}><option value="primary">Primary</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></Form.Select></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Active</Form.Label><Form.Check type="switch" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Short Desc (EN)</Form.Label><Form.Control as="textarea" rows={2} value={form.shortDescEn} onChange={(e) => setForm({ ...form, shortDescEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Short Desc (BN)</Form.Label><Form.Control as="textarea" rows={2} value={form.shortDescBn} onChange={(e) => setForm({ ...form, shortDescBn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Full Desc (EN)</Form.Label><Form.Control as="textarea" rows={4} value={form.fullDescEn} onChange={(e) => setForm({ ...form, fullDescEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Full Desc (BN)</Form.Label><Form.Control as="textarea" rows={4} value={form.fullDescBn} onChange={(e) => setForm({ ...form, fullDescBn: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="mt-3">
              <Button type="submit" variant="success" disabled={saving}>{saving ? 'Saving...' : 'Create Tier'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
