'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Spinner, Form, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await communityMembershipApi.listPurchases(params);
      setPurchases(res.data ?? []);
      setMeta(res.meta ?? {});
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { pending_payment: 'warning', paid: 'success', cancelled: 'danger', refunded: 'info' };
    return <Badge bg={colors[s] || 'secondary'}>{s}</Badge>;
  };

  return (
    <>
      <PageHeader title="Purchases" />
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2">
            <Col md={4}><Form.Control placeholder="Search name/mobile/card..." value={search} onChange={(e) => setSearch(e.target.value)} /></Col>
            <Col md={3}><Form.Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Status</option><option value="pending_payment">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></Form.Select></Col>
          </Row>
        </Card.Body>
      </Card>
      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Tier</th><th>Amount</th><th>Status</th><th>Card</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {purchases.map((p: any, i: number) => (
                <tr key={p.id}>
                  <td>{i + 1}</td><td>{p.memberName}</td><td>{p.memberMobile}</td>
                  <td><Badge bg="info">{p.tier?.nameEn}</Badge></td>
                  <td>৳{Number(p.amountBdt).toLocaleString()}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>{p.card ? <Badge bg="success">{p.card.cardNumber}</Badge> : '-'}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button as={Link as any} href={`/community-care/membership/purchases/${p.id}`} size="sm" variant="info">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              {Array.from({ length: meta.totalPages }, (_, i) => (
                <Button key={i} size="sm" variant={meta.page === i + 1 ? 'primary' : 'outline-primary'} onClick={() => fetch(i + 1)}>{i + 1}</Button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
