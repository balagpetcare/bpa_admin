'use client'

import React from 'react'
import { Card } from 'react-bootstrap'
import { useWizardContext } from '../useCampaignWizard'
import BilingualRichText from '../../BilingualRichText'

export default function CampaignPolicyStep() {
  const { form: { watch, setValue } } = useWizardContext()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Policy & Informational Content</h5></Card.Header>
      <Card.Body>
        <BilingualRichText
          labelEn="Eligibility (EN)" labelBn="Eligibility (BN)"
          valueEn={watch('eligibilityContentEn') ?? ''} valueBn={watch('eligibilityContentBn') ?? ''}
          onChangeEn={(val) => setValue('eligibilityContentEn', val, { shouldValidate: true, shouldDirty: true })}
          onChangeBn={(val) => setValue('eligibilityContentBn', val, { shouldValidate: true, shouldDirty: true })}
        />
        <BilingualRichText
          labelEn="How It Works (EN)" labelBn="How It Works (BN)"
          valueEn={watch('howItWorksContentEn') ?? ''} valueBn={watch('howItWorksContentBn') ?? ''}
          onChangeEn={(val) => setValue('howItWorksContentEn', val, { shouldValidate: true, shouldDirty: true })}
          onChangeBn={(val) => setValue('howItWorksContentBn', val, { shouldValidate: true, shouldDirty: true })}
        />
        <BilingualRichText
          labelEn="Terms (EN)" labelBn="Terms (BN)"
          valueEn={watch('termsContentEn') ?? ''} valueBn={watch('termsContentBn') ?? ''}
          onChangeEn={(val) => setValue('termsContentEn', val, { shouldValidate: true, shouldDirty: true })}
          onChangeBn={(val) => setValue('termsContentBn', val, { shouldValidate: true, shouldDirty: true })}
        />
        <BilingualRichText
          labelEn="Refund Policy (EN)" labelBn="Refund Policy (BN)"
          valueEn={watch('refundPolicyEn') ?? ''} valueBn={watch('refundPolicyBn') ?? ''}
          onChangeEn={(val) => setValue('refundPolicyEn', val, { shouldValidate: true, shouldDirty: true })}
          onChangeBn={(val) => setValue('refundPolicyBn', val, { shouldValidate: true, shouldDirty: true })}
        />
      </Card.Body>
    </Card>
  )
}
