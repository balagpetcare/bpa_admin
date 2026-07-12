'use client'

import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useWizardContext } from '../useCampaignWizard'
import MembershipHtmlEditor from '../../MembershipHtmlEditor'

export default function CampaignPolicyStep() {
  const { form: { control } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Policy & Informational Content</h5></Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}><Controller name="eligibilityContentEn" control={control} render={({ field }) => <MembershipHtmlEditor label="Eligibility (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="eligibilityContentBn" control={control} render={({ field }) => <MembershipHtmlEditor label="Eligibility (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="howItWorksContentEn" control={control} render={({ field }) => <MembershipHtmlEditor label="How It Works (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="howItWorksContentBn" control={control} render={({ field }) => <MembershipHtmlEditor label="How It Works (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="termsContentEn" control={control} render={({ field }) => <MembershipHtmlEditor label="Terms (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="termsContentBn" control={control} render={({ field }) => <MembershipHtmlEditor label="Terms (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="refundPolicyEn" control={control} render={({ field }) => <MembershipHtmlEditor label="Refund Policy (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
          <Col md={6}><Controller name="refundPolicyBn" control={control} render={({ field }) => <MembershipHtmlEditor label="Refund Policy (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
