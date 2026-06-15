'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function ProgramSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.getProgram();
      const p = res.data;
      if (p) {
        setForm({
          nameEn: p.nameEn, nameBn: p.nameBn,
          descriptionEn: p.descriptionEn || '', descriptionBn: p.descriptionBn || '',
          offerStartAt: p.offerStartAt ? p.offerStartAt.slice(0, 16) : '',
          offerEndAt: p.offerEndAt ? p.offerEndAt.slice(0, 16) : '',
          priceAfterOffer: p.priceAfterOffer || 'USE_REGULAR_PRICE',
          offerBannerEn: p.offerBannerEn || '', offerBannerBn: p.offerBannerBn || '',
          legalDisclaimer: p.legalDisclaimer || '',
          cardValidityLabel: p.cardValidityLabel || '5-Year Card Validity',
          isActive: p.isActive,
        });
      }
    } catch {
      /* If API returns error, form stays null so "Create default" button shows */
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreateDefault = async () => {
    setCreating(true);
    setError('');
    try {
      // The GET endpoint auto-creates on the backend now, so just re-fetch
      await communityMembershipApi.getProgram();
      await fetch();
    } catch {
      setError('Failed to create default program. The API may need to be running.');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const data: any = { ...form };
      if (data.offerStartAt) data.offerStartAt = new Date(data.offerStartAt).toISOString();
      else data.offerStartAt = null;
      if (data.offerEndAt) data.offerEndAt = new Date(data.offerEndAt).toISOString();
      else data.offerEndAt = null;
      await communityMembershipApi.updateProgram(data);
      setSuccess(true);
    } catch {
      setError('Failed to update');
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  if (!form) {
    return (
      <>
        <PageHeader title="Program Settings" breadcrumbs={[{ label: 'Membership', href: '/community-care/membership' }, { label: 'Settings' }]} />
        <Card className="text-center">
          <Card.Body className="py-5">
            <p className="text-muted mb-3">Program settings not found.</p>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="success" onClick={handleCreateDefault} disabled={creating}>
              {creating ? 'Creating...' : 'Create Default Program Settings'}
            </Button>
            <p className="text-muted mt-3 small">
              This will create the default BPA Community Care Partner Card Program with standard settings.
              You can edit them after creation.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Program Settings" breadcrumbs={[{ label: 'Membership', href: '/community-care/membership' }, { label: 'Settings' }]} />
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(false)}>Settings saved successfully!</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Program Name (EN)</Form.Label><Form.Control value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Program Name (BN)</Form.Label><Form.Control value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Description (EN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Description (BN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionBn} onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })} /></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Label>Legal Disclaimer</Form.Label><Form.Control as="textarea" rows={4} value={form.legalDisclaimer} onChange={(e) => setForm({ ...form, legalDisclaimer: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Card Validity Label (e.g. &quot;5-Year Card Validity&quot;)</Form.Label><Form.Control value={form.cardValidityLabel} onChange={(e) => setForm({ ...form, cardValidityLabel: e.target.value })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Offer Start</Form.Label><Form.Control type="datetime-local" value={form.offerStartAt} onChange={(e) => setForm({ ...form, offerStartAt: e.target.value })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Offer End</Form.Label><Form.Control type="datetime-local" value={form.offerEndAt} onChange={(e) => setForm({ ...form, offerEndAt: e.target.value })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>After Offer Expires</Form.Label><Form.Select value={form.priceAfterOffer} onChange={(e) => setForm({ ...form, priceAfterOffer: e.target.value })}>
                <option value="USE_REGULAR_PRICE">Use Regular Price</option>
                <option value="HIDE_TIER">Hide Tier</option>
                <option value="SHOW_EXPIRED_MESSAGE">Show Expired Message</option>
              </Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Offer Banner (EN)</Form.Label><Form.Control value={form.offerBannerEn} onChange={(e) => setForm({ ...form, offerBannerEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Offer Banner (BN)</Form.Label><Form.Control value={form.offerBannerBn} onChange={(e) => setForm({ ...form, offerBannerBn: e.target.value })} /></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Check type="switch" label="Program Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></Form.Group></Col>
            </Row>
            <div className="mt-3">
              <Button type="submit" variant="success" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
