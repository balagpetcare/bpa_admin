'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import Link from 'next/link';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function TiersPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      // api.get() unwraps json.data — returns items array directly
      const res = await communityMembershipApi.listTiers();
      setTiers(res ?? []);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tier?')) return;
    await communityMembershipApi.deleteTier(id);
    fetch();
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <>
      <PageHeader
        title="Tiers & Pricing"
        action={
          <Button as={Link as any} href="/community-care/membership/tiers/create" variant="success">
            + Add Tier
          </Button>
        }
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th><th>Name (EN)</th><th>Name (BN)</th><th>Slug</th>
            <th>Launch Price</th><th>Regular Price</th>
            <th>Pet Limit</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t: any, i: number) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.nameEn}</td>
              <td>{t.nameBn}</td>
              <td><Badge bg="secondary">{t.slug}</Badge></td>
              <td>৳{Number(t.launchPriceBdt).toLocaleString()}</td>
              <td>৳{Number(t.regularPriceBdt).toLocaleString()}</td>
              <td>{t.petLimitMin}-{t.petLimitMax}</td>
              <td><Badge bg={t.isActive ? 'success' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge></td>
              <td>
                <Button as={Link as any} href={`/community-care/membership/tiers/${t.id}/edit`} size="sm" variant="info" className="me-1">Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
