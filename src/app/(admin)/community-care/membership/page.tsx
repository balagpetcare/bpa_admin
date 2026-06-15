'use client';

import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Spinner, Table, Badge, ProgressBar } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';

export default function MembershipDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // api.get() unwraps json.data, so res is the dashboard object directly
      const res = await communityMembershipApi.getDashboard();
      setData(res);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const cards = [
    { label: 'Total Members', value: data?.totalMembers ?? 0, color: 'primary' },
    { label: 'Total Revenue', value: `৳${(data?.totalRevenue ?? 0).toLocaleString()}`, color: 'success' },
    { label: 'Active Cards', value: data?.activeCards ?? 0, color: 'info' },
    { label: 'Pending Payments', value: data?.pendingPayments ?? 0, color: 'warning' },
    { label: 'Upgrade Requests', value: data?.pendingUpgrades ?? 0, color: 'danger' },
    { label: 'Offer Active', value: data?.offerActive ? 'Yes' : 'No', color: data?.offerActive ? 'success' : 'secondary' },
  ];

  const zoneDemand: any[] = data?.zoneDemand ?? [];
  const maxScore = zoneDemand[0]?.demandScore ?? 1;

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

      {zoneDemand.length > 0 && (
        <Card className="mt-4 shadow-sm">
          <Card.Header className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Zone Demand Ranking</h5>
            <small className="text-muted">Score = paid × 2 + pending × 1</small>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>Rank</th>
                  <th>Zone</th>
                  <th>Paid Members</th>
                  <th>Total (incl. pending)</th>
                  <th>Demand Score</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {zoneDemand.map((z: any) => {
                  const pct = maxScore > 0 ? Math.min(100, Math.round((z.demandScore / maxScore) * 100)) : 0;
                  return (
                    <tr key={z.id}>
                      <td>
                        <Badge bg={z.rank === 1 ? 'success' : 'secondary'}>#{z.rank}</Badge>
                      </td>
                      <td>
                        <span className="fw-semibold">{z.name}</span>
                        <br />
                        <small className="text-muted">{z.city}, {z.district}</small>
                      </td>
                      <td>{z.paidPurchases}</td>
                      <td>{z.totalPurchases}</td>
                      <td><strong>{z.demandScore}</strong></td>
                      <td style={{ minWidth: 120 }}>
                        <ProgressBar
                          now={pct}
                          variant={z.rank === 1 ? 'success' : 'info'}
                          style={{ height: 8 }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
