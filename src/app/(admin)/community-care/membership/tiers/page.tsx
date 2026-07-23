'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Badge, Spinner } from 'react-bootstrap'
import Link from 'next/link'
import { communityMembershipApi, type CommunityMembershipTier } from '@/lib/api/community-membership.api'
import PageHeader from '@/components/ui/PageHeader'

export default function TiersPage() {
  const [tiers, setTiers] = useState<CommunityMembershipTier[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await communityMembershipApi.listTiers()
      setTiers(res ?? [])
    } catch {
      setTiers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tier?')) return
    await communityMembershipApi.deleteTier(id)
    fetch()
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <PageHeader
        title="Membership Tiers"
        action={
          <Button as={Link as any} href="/community-care/membership/tiers/create" variant="success">
            + Add Tier
          </Button>
        }
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name (EN)</th>
            <th>Name (BN)</th>
            <th>Slug</th>
            <th>Code</th>
            <th>Launch Price</th>
            <th>Regular Price</th>
            <th>Pets</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, index) => (
            <tr key={tier.id}>
              <td>{index + 1}</td>
              <td>{tier.nameEn}</td>
              <td>{tier.nameBn}</td>
              <td>
                <Badge bg="secondary">{tier.slug}</Badge>
              </td>
              <td>{tier.code ?? tier.slug.toUpperCase()}</td>
              <td>BDT {Number(tier.launchPriceBdt).toLocaleString()}</td>
              <td>BDT {Number(tier.regularPriceBdt).toLocaleString()}</td>
              <td>
                {tier.petLimitMin}-{tier.includedPets}-{tier.petLimitMax}
              </td>
              <td>
                <Badge bg={tier.isActive ? 'success' : 'secondary'}>{tier.status ?? (tier.isActive ? 'active' : 'inactive')}</Badge>
              </td>
              <td>
                <Button as={Link as any} href={`/community-care/membership/tiers/${tier.id}/edit`} size="sm" variant="info" className="me-1">
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(tier.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
