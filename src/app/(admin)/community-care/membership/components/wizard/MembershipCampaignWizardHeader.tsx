'use client'

import React from 'react'
import { Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useWizardContext } from './useCampaignWizard'

export default function MembershipCampaignWizardHeader() {
  const { steps, currentStepIndex, goToStep, form } = useWizardContext()
  const { errors } = form.formState

  return (
    <Card className="mb-4">
      <Card.Body className="p-0">
        <div className="d-flex flex-nowrap overflow-auto px-3 py-3 wizard-stepper">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex
            const hasError = step.fields.some((field) => !!errors[field as keyof typeof errors])

            let variantClass = 'text-muted'
            let bgClass = 'bg-light text-secondary'
            let icon = index + 1

            if (isActive) {
              variantClass = 'text-primary fw-bold'
              bgClass = 'bg-primary text-white'
            } else if (hasError) {
              variantClass = 'text-danger fw-bold'
              bgClass = 'bg-danger text-white'
            } else if (isCompleted) {
              variantClass = 'text-success fw-bold'
              bgClass = 'bg-success text-white'
            }

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`d-flex flex-column align-items-center position-relative ${isActive || isCompleted ? 'cursor-pointer' : ''}`}
                  style={{ minWidth: '120px', flex: 1, cursor: isCompleted || isActive ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (isCompleted || isActive) goToStep(step.id)
                  }}
                  role="button"
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${bgClass}`} style={{ width: '36px', height: '36px', zIndex: 2 }}>
                    {hasError ? (
                      <Icon icon="solar:danger-circle-bold" width="20" />
                    ) : isCompleted ? (
                      <Icon icon="solar:check-circle-bold" width="20" />
                    ) : (
                      <span className="fw-bold">{icon}</span>
                    )}
                  </div>
                  <div className={`text-center small ${variantClass}`}>{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="d-none d-md-block flex-grow-1 align-self-start mt-3" style={{ height: '2px', backgroundColor: index < currentStepIndex ? 'var(--bs-success)' : 'var(--bs-border-color)' }}></div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </Card.Body>
    </Card>
  )
}
