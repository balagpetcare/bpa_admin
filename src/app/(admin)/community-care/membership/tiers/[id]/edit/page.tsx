'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function EditTierPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.getTier(id);
      const t = res.data;
      if (t) {
        setForm({
          nameEn: t.nameEn, nameBn: t.nameBn, slug: t.slug,
          launchPriceBdt: Number(t.launchPriceBdt), regularPriceBdt: Number(t.regularPriceBdt),
          petLimitMin: t.petLimitMin, petLimitMax: t.petLimitMax, validityMonths: t.validityMonths,
          badgeTextEn: t.badgeTextEn || '', badgeTextBn: t.badgeTextBn || '',
          shortDescEn: t.shortDescEn || '', shortDescBn: t.shortDescBn || '',
          fullDescEn: t.fullDescEn || '', fullDescBn: t.fullDescBn || '',
          cardTheme: t.cardTheme || 'primary', isActive: t.isActive, sortOrder: t.sortOrder,
        });
      }
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await communityMembershipApi.updateTier(id, form);
      router.push('/community-care/membership/tiers');
    } catch { alert('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!form) return <div className="text-center py-5">Tier not found</div>;

  return (
    <>
      <PageHeader title="Edit Tier" breadcrumbs={[{ label: 'Tiers & Pricing', href: '/community-care/membership/tiers' }, { label: 'Edit' }]} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Name (EN)</Form.Label><Form.Control value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Name (BN)</Form.Label><Form.Control value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Slug</Form.Label><Form.Select value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}><option value="primary">Primary</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></Form.Select></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Launch Price (৳)</Form.Label><Form.Control type="number" value={form.launchPriceBdt} onChange={(e) => setForm({ ...form, launchPriceBdt: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Regular Price (৳)</Form.Label><Form.Control type="number" value={form.regularPriceBdt} onChange={(e) => setForm({ ...form, regularPriceBdt: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Pet Min</Form.Label><Form.Control type="number" value={form.petLimitMin} onChange={(e) => setForm({ ...form, petLimitMin: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Pet Max</Form.Label><Form.Control type="number" value={form.petLimitMax} onChange={(e) => setForm({ ...form, petLimitMax: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Validity (Months)</Form.Label><Form.Control type="number" value={form.validityMonths} onChange={(e) => setForm({ ...form, validityMonths: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Sort Order</Form.Label><Form.Control type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Badge (EN)</Form.Label><Form.Control value={form.badgeTextEn} onChange={(e) => setForm({ ...form, badgeTextEn: e.target.value })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Badge (BN)</Form.Label><Form.Control value={form.badgeTextBn} onChange={(e) => setForm({ ...form, badgeTextBn: e.target.value })} /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Card Theme</Form.Label><Form.Select value={form.cardTheme} onChange={(e) => setForm({ ...form, cardTheme: e.target.value })}><option value="primary">Primary</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></Form.Select></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Active</Form.Label><Form.Check type="switch" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Short Desc (EN)</Form.Label><Form.Control as="textarea" rows={2} value={form.shortDescEn} onChange={(e) => setForm({ ...form, shortDescEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Short Desc (BN)</Form.Label><Form.Control as="textarea" rows={2} value={form.shortDescBn} onChange={(e) => setForm({ ...form, shortDescBn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Full Desc (EN)</Form.Label><Form.Control as="textarea" rows={4} value={form.fullDescEn} onChange={(e) => setForm({ ...form, fullDescEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Full Desc (BN)</Form.Label><Form.Control as="textarea" rows={4} value={form.fullDescBn} onChange={(e) => setForm({ ...form, fullDescBn: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="mt-3">
              <Button type="submit" variant="success" disabled={saving}>{saving ? 'Saving...' : 'Update Tier'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
