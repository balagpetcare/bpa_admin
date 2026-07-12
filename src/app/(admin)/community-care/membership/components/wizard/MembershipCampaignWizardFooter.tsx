'use client'

import React from 'react'
import { Button } from 'react-bootstrap'
import { useWizardContext } from './useCampaignWizard'

interface Props {
  onSaveAsDraft: () => Promise<void>
  onSubmit: () => Promise<void>
  isSaving: boolean
}

export default function MembershipCampaignWizardFooter({ onSaveAsDraft, onSubmit, isSaving }: Props) {
  const { isFirstStep, isLastStep, nextStep, prevStep } = useWizardContext()

  return (
    <div className="position-sticky bottom-0 p-3 bg-white border-top shadow-sm d-flex justify-content-between align-items-center mt-4" style={{ zIndex: 1000 }}>
      <div>
        <Button variant="outline-secondary" onClick={prevStep} disabled={isFirstStep || isSaving}>
          Previous
        </Button>
      </div>
      <div className="d-flex gap-2">
        <Button variant="outline-primary" onClick={onSaveAsDraft} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        {isLastStep ? (
          <Button variant="success" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? 'Publishing...' : 'Complete & Publish'}
          </Button>
        ) : (
          <Button variant="primary" onClick={nextStep} disabled={isSaving}>
            Next Step
          </Button>
        )}
      </div>
    </div>
  )
}
