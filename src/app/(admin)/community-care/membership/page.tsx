'use client';

import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';

export default function MembershipDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.getDashboard();
      setData(res.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const cards = [
    { label: 'Total Members', value: data?.totalMembers ?? 0, color: 'primary' },
    { label: 'Total Revenue', value: `৳${(data?.totalRevenue ?? 0).toLocaleString()}`, color: 'success' },
    { label: 'Active Cards', value: data?.activeCards ?? 0, color: 'info' },
    { label: 'Pending Payments', value: data?.pendingPayments ?? 0, color: 'warning' },
    { label: 'Upgrade Requests', value: data?.pendingUpgrades ?? 0, color: 'danger' },
    { label: 'Offer Active', value: data?.offerActive ? 'Yes' : 'No', color: data?.offerActive ? 'success' : 'secondary' },
  ];

  return (
    <>
      <div className="page-title-box d-flex align-items-center justify-content-between">
        <h4 className="mb-0">Membership Dashboard</h4>
      </div>
      <Row className="g-3">
        {cards.map((c) => (
          <Col md={4} key={c.label}>
            <Card className={`border-${c.color} shadow-sm`}>
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">{c.label}</h6>
                <h3 className={`text-${c.color} mb-0`}>{c.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
