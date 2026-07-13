'use client'

import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useWizardContext } from './useCampaignWizard'
import { usePermission } from '@/hooks/usePermission'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  onSaveAsDraft: () => Promise<void>
  onSubmit: (newStatus?: 'draft' | 'published' | 'application_open' | 'closed' | 'archived') => Promise<void>
  isSaving: boolean
}

export default function MembershipCampaignWizardFooter({ onSaveAsDraft, onSubmit, isSaving }: Props) {
  const { isFirstStep, isLastStep, prevStep, campaign, isEdit, form } = useWizardContext()
  const { can } = usePermission()
  const router = useRouter()
  
  const currentStatus = campaign?.status ?? 'draft'
  const publishedAt = form.watch('publishedAt')
  const isScheduled = publishedAt && new Date(publishedAt) > new Date()

  return (
    <div className="position-sticky bottom-0 p-3 bg-white border-top shadow-sm d-flex justify-content-between align-items-center mt-4" style={{ zIndex: 1000 }}>
      <div>
        <Button variant="outline-secondary" onClick={prevStep} disabled={isFirstStep || isSaving}>
          Back
        </Button>
        <Button variant="link" className="ms-2 text-muted" onClick={() => router.push('/community-care/membership/campaigns')} disabled={isSaving}>
          Cancel
        </Button>
      </div>
      <div className="d-flex gap-2 align-items-center">
        {isEdit && can('membership_campaigns:read') && (
          <Link href={`/community-care/membership/campaigns/${campaign?.id}`} className="btn btn-outline-info" target="_blank">
            Preview
          </Link>
        )}
        
        {isLastStep ? (
          <>
            {currentStatus === 'draft' && (
              <Button variant="outline-primary" onClick={onSaveAsDraft} disabled={isSaving || !can('membership_campaigns:create')}>
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            )}

            {isEdit && currentStatus !== 'draft' && (
              <Button variant="primary" onClick={() => onSubmit()} disabled={isSaving || !can('membership_campaigns:update')}>
                {isSaving ? 'Updating...' : 'Update Campaign'}
              </Button>
            )}

            {currentStatus === 'published' || currentStatus === 'application_open' ? (
              <Button variant="warning" onClick={() => onSubmit('draft')} disabled={isSaving || !can('membership_campaigns:update')}>
                Pause / Unpublish
              </Button>
            ) : null}

            {currentStatus === 'draft' && (
              <Button variant="success" onClick={() => onSubmit('published')} disabled={isSaving || !can('membership_campaigns:update')}>
                {isSaving ? 'Publishing...' : (isScheduled ? 'Schedule Publication' : 'Publish Now')}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button variant="outline-primary" onClick={onSaveAsDraft} disabled={isSaving || !can(isEdit ? 'membership_campaigns:update' : 'membership_campaigns:create')}>
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button variant="primary" onClick={() => onSubmit()} disabled={isSaving || !can(isEdit ? 'membership_campaigns:update' : 'membership_campaigns:create')}>
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
