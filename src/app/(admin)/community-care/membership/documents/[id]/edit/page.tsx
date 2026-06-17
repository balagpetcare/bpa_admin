'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.getDocument(id);
      // api.get() unwraps json.data — res is the document object directly
      if (res && res.titleEn) setForm({ titleEn: res.titleEn, titleBn: res.titleBn, contentEn: res.contentEn || '', contentBn: res.contentBn || '', isActive: res.isActive });
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await communityMembershipApi.updateDocument(id, form);
      router.push('/community-care/membership/documents');
    } catch { alert('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!form) return <div className="text-center py-5">Document not found</div>;

  return (
    <>
      <PageHeader title="Edit Document" breadcrumbs={[{ label: 'Documents', href: '/community-care/membership/documents' }, { label: 'Edit' }]} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Content (EN)</Form.Label><Form.Control as="textarea" rows={12} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Content (BN)</Form.Label><Form.Control as="textarea" rows={12} value={form.contentBn} onChange={(e) => setForm({ ...form, contentBn: e.target.value })} /></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Check type="switch" label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></Form.Group></Col>
            </Row>
            <div className="mt-3"><Button type="submit" variant="success" disabled={saving}>{saving ? 'Saving...' : 'Update Document'}</Button></div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
