'use client'

import React from 'react'
import Link from 'next/link'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { useWizardContext } from '../useCampaignWizard'
import StatusBadge from '@/components/ui/StatusBadge'

export default function CampaignPlansStep() {
  const { campaign, isEdit } = useWizardContext()

  if (!isEdit || !campaign) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info" className="mb-0">
            You must save the campaign basics before adding plans.
          </Alert>
        </Card.Body>
      </Card>
    )
  }

  const plans = campaign.plans ?? []
  const activePlans = plans.filter((item) => item.isActive)

  return (
    <div className="mb-4">
      <h5 className="mb-3">Campaign Plans & Offers</h5>
      <Alert variant="info" className="small">
        Membership Tier is the master source of truth. Campaign offer changes apply only to future purchases. Existing memberships retain their stored
        entitlement.
      </Alert>

      {activePlans.length === 0 && (
        <Alert variant="danger">
          <strong>No active plans found.</strong> Published campaigns must have at least one active plan.
        </Alert>
      )}

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="text-muted me-2">Active Plans:</span>
              <Badge bg={activePlans.length > 0 ? 'success' : 'danger'}>{activePlans.length}</Badge>
            </div>
            <Button as={Link as any} href={`/community-care/membership/campaigns/${campaign.id}/plans`} variant="outline-primary">
              Manage Plans & Offers
            </Button>
          </div>

          <Table hover responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Display Name</th>
                <th>Pricing</th>
                <th>Pets</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No plans configured for this campaign.
                  </td>
                </tr>
              ) : (
                plans.map((item) => (
                  <tr key={item.id}>
                    <td>{item.tier?.code ?? item.code}</td>
                    <td>{item.nameEn}</td>
                    <td>
                      <div>Regular: BDT {Number(item.regularPriceSnapshot ?? item.regularPrice ?? 0).toLocaleString()}</div>
                      <div className="text-success small">Campaign: BDT {Number(item.campaignPrice ?? item.offerPrice ?? 0).toLocaleString()}</div>
                    </td>
                    <td>
                      {item.includedPetsSnapshot ?? item.maxCoveredPets} included / {item.maxPetsSnapshot ?? item.maxCoveredPets} max
                    </td>
                    <td>
                      <StatusBadge status={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}
