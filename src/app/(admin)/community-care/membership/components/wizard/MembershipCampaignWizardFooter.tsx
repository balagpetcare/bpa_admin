'use client'

import React, { useMemo } from 'react'
import { Alert, Button } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useNotificationContext } from '@/context/useNotificationContext'
import { usePermission } from '@/hooks/usePermission'
import { type MembershipCampaignStatus } from '@/lib/api/membership-campaign.api'
import { getPublishIssues } from './campaign-workflow'
import { useWizardContext } from './useCampaignWizard'

interface Props {
  onSaveAsDraft: () => Promise<void>
  onSubmit: (newStatus?: MembershipCampaignStatus) => Promise<void>
  isSaving: boolean
}

export default function MembershipCampaignWizardFooter({ onSaveAsDraft, onSubmit, isSaving }: Props) {
  const { isFirstStep, isLastStep, prevStep, campaign, isEdit, form } = useWizardContext()
  const { can } = usePermission()
  const router = useRouter()
  const { showNotification } = useNotificationContext()

  const currentStatus = campaign?.status ?? 'draft'
  const publishedAt = form.watch('publishedAt')
  const formStatus = (form.watch('status') as MembershipCampaignStatus | undefined) ?? 'draft'
  const isScheduled = Boolean(publishedAt && new Date(publishedAt) > new Date())
  const currentValues = form.watch()
  const publishIssues = useMemo(() => getPublishIssues(currentValues, campaign, new Date(), formStatus), [campaign, currentValues, formStatus])
  const publishBlockers = publishIssues.filter((item) => item.severity === 'error')
  const publishWarnings = publishIssues.filter((item) => item.severity === 'warning')
  const shouldShowPublishBlockers = isLastStep

  async function guardSubmit(nextStatus?: MembershipCampaignStatus) {
    const isPublishAction = nextStatus === 'published' || nextStatus === 'scheduled'

    if (isLastStep && isPublishAction && publishBlockers.length > 0) {
      showNotification({
        title: 'Publish blocked',
        message: publishBlockers[0].message,
        variant: 'danger',
        delay: 4000,
      })
      return
    }

    if (isPublishAction) {
      const hasClosedApplications = publishWarnings.some((item) => item.message.includes('Application window is already closed'))
      if (hasClosedApplications) {
        const archiveInstead = await confirmDialog({
          title: 'Application window is closed',
          text: 'This campaign cannot accept new applications with the current dates. Archive it instead or go back and edit the schedule.',
          confirmText: 'Archive Campaign',
          cancelText: 'Edit Dates',
          variant: 'warning',
        })
        if (archiveInstead) {
          await onSubmit('archived')
        }
        return
      }
    }

    await onSubmit(nextStatus)
  }

  return (
    <div className="position-sticky bottom-0 p-3 bg-white border-top shadow-sm mt-4" style={{ zIndex: 1000 }}>
      {shouldShowPublishBlockers && (publishBlockers.length > 0 || publishWarnings.length > 0) ? (
        <Alert variant={publishBlockers.length > 0 ? 'danger' : 'warning'} className="small mb-3">
          <div className="fw-semibold mb-1">
            {publishBlockers.length > 0 ? `${publishBlockers.length} blocker(s)` : 'Publish warnings'}
          </div>
          <div>{publishIssues[0]?.message}</div>
          {publishIssues.length > 1 && <div className="small mt-1">{publishIssues.length - 1} additional issue(s) are listed in Review & Publish.</div>}
        </Alert>
      ) : (
        <div className="small text-muted mb-3 d-flex align-items-center">
          <Icon icon="solar:info-circle-outline" className="me-1" />
          Current publish state:{' '}
          {(currentStatus === 'published' || currentStatus === 'application_open') 
            ? (publishBlockers.length > 0 ? <span className="text-danger ms-1 fw-bold">Published, but configuration invalid</span> : 'Published') 
            : 'Draft'}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div>
          <Button variant="outline-secondary" onClick={prevStep} disabled={isFirstStep || isSaving}>
            Back
          </Button>
          <Button variant="link" className="ms-2 text-muted" onClick={() => router.push('/community-care/membership/campaigns')} disabled={isSaving}>
            Cancel
          </Button>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap justify-content-end">
          {isEdit && can('membership_campaigns:read') && (
            <Link href={`/community-care/membership/campaigns/${campaign?.id}/edit?step=review`} className="btn btn-outline-info" target="_blank">
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
                <Button variant="primary" onClick={() => guardSubmit(formStatus)} disabled={isSaving || !can('membership_campaigns:update')}>
                  {isSaving ? 'Updating...' : 'Update Campaign'}
                </Button>
              )}

              {formStatus === 'published' ? (
                <Button variant="warning" onClick={() => guardSubmit('application_closed')} disabled={isSaving || !can('membership_campaigns:update')}>
                  Pause Campaign
                </Button>
              ) : null}

              {formStatus === 'draft' && (
                <Button variant="success" onClick={() => guardSubmit(isScheduled ? 'scheduled' : 'published')} disabled={isSaving || !can('membership_campaigns:update')}>
                  {isSaving ? 'Publishing...' : (isScheduled ? 'Schedule Publication' : 'Publish Now')}
                </Button>
              )}

              {formStatus === 'scheduled' && (
                <Button variant="success" onClick={() => guardSubmit('scheduled')} disabled={isSaving || !can('membership_campaigns:update')}>
                  {isSaving ? 'Saving...' : 'Save Scheduled Campaign'}
                </Button>
              )}

              {formStatus === 'application_closed' && (
                <Button variant="warning" onClick={() => guardSubmit('application_closed')} disabled={isSaving || !can('membership_campaigns:update')}>
                  {isSaving ? 'Saving...' : 'Save Paused Campaign'}
                </Button>
              )}

              {formStatus === 'published' && !isEdit && (
                <Button variant="success" onClick={() => guardSubmit('published')} disabled={isSaving || !can('membership_campaigns:update')}>
                  {isSaving ? 'Publishing...' : 'Save Published Campaign'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline-primary" onClick={onSaveAsDraft} disabled={isSaving || !can(isEdit ? 'membership_campaigns:update' : 'membership_campaigns:create')}>
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button variant="primary" onClick={() => guardSubmit(formStatus)} disabled={isSaving || !can(isEdit ? 'membership_campaigns:update' : 'membership_campaigns:create')}>
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
