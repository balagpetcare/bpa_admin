'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Spinner } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function UpgradesPage() {
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.listUpgrades();
      setUpgrades(res.data ?? []);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { pending_payment: 'warning', paid: 'info', completed: 'success', cancelled: 'danger', failed: 'danger' };
    return <Badge bg={colors[s] || 'secondary'}>{s}</Badge>;
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <>
      <PageHeader title="Upgrade Requests" />
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead><tr><th>#</th><th>Member</th><th>From</th><th>To</th><th>Upgrade Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {upgrades.map((u: any, i: number) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.purchase?.memberName}</td>
                  <td><Badge bg="secondary">{u.fromTier?.nameEn}</Badge></td>
                  <td><Badge bg="info">{u.toTier?.nameEn}</Badge></td>
                  <td>৳{Number(u.upgradeAmountBdt).toLocaleString()}</td>
                  <td>{statusBadge(u.status)}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {upgrades.length === 0 && <tr><td colSpan={7} className="text-center">No upgrade requests</td></tr>}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
