'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

const DOC_TYPES = [
  { value: 'terms_and_conditions', label: 'Terms & Conditions' },
  { value: 'refund_policy', label: 'Refund Policy' },
  { value: 'service_availability_policy', label: 'Service Availability Policy' },
  { value: 'discount_policy', label: 'Discount Policy' },
  { value: 'welcome_letter', label: 'Welcome Letter' },
];

export default function CreateDocumentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ documentType: 'terms_and_conditions', titleEn: '', titleBn: '', contentEn: '', contentBn: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await communityMembershipApi.createDocument(form);
      router.push('/community-care/membership/documents');
    } catch { alert('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title="Create Document" breadcrumbs={[{ label: 'Documents', href: '/community-care/membership/documents' }, { label: 'Create' }]} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={4}><Form.Group><Form.Label>Document Type</Form.Label><Form.Select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>{DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Form.Select></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Content (EN) — supports plain text</Form.Label><Form.Control as="textarea" rows={12} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Content (BN)</Form.Label><Form.Control as="textarea" rows={12} value={form.contentBn} onChange={(e) => setForm({ ...form, contentBn: e.target.value })} /></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Check type="switch" label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></Form.Group></Col>
            </Row>
            <div className="mt-3"><Button type="submit" variant="success" disabled={saving}>{saving ? 'Saving...' : 'Create Document'}</Button></div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
