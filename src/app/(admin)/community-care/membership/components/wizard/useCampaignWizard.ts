'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useForm, UseFormReturn } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { MembershipCampaign } from '@/lib/api/membership-campaign.api'
import {
  wizardSchema,
  CampaignWizardFormValues,
  campaignToWizardValues,
  WIZARD_STEPS,
  WizardStepId,
} from './wizard.types'

interface WizardContextType {
  form: UseFormReturn<CampaignWizardFormValues>
  currentStepIndex: number
  currentStepId: WizardStepId
  steps: typeof WIZARD_STEPS
  isFirstStep: boolean
  isLastStep: boolean
  nextStep: () => Promise<void>
  prevStep: () => void
  goToStep: (stepId: WizardStepId) => Promise<void>
  campaign?: MembershipCampaign | null
  isEdit: boolean
  isDirty: boolean
}

const WizardContext = createContext<WizardContextType | null>(null)

export function useWizardContext() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizardContext must be used within WizardProvider')
  return ctx
}

export function useCampaignWizard(campaign?: MembershipCampaign | null) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const form = useForm<CampaignWizardFormValues>({
    resolver: yupResolver(wizardSchema),
    defaultValues: campaignToWizardValues(campaign),
    mode: 'onTouched',
  })

  const stepQuery = searchParams.get('step') as WizardStepId | null
  const currentStepIndex = Math.max(0, WIZARD_STEPS.findIndex((s) => s.id === stepQuery))
  const currentStepId = WIZARD_STEPS[currentStepIndex].id
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1

  // Unsaved changes protection
  const { isDirty } = form.formState
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // If there's no step query, update URL without navigation reload
  useEffect(() => {
    if (!stepQuery) {
      router.replace(`${pathname}?step=${WIZARD_STEPS[0].id}`, { scroll: false })
    }
  }, [stepQuery, pathname, router])

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const step = WIZARD_STEPS[stepIndex]
    if (!step.fields.length) return true
    
    const isStepValid = await form.trigger(step.fields as any)
    if (!isStepValid) {
      // Find the first error and focus it if possible
      const errors = form.formState.errors
      const firstErrorField = step.fields.find(f => errors[f as keyof typeof errors])
      if (firstErrorField) {
        form.setFocus(firstErrorField as any)
      }
    }
    return isStepValid
  }

  const goToStep = async (stepId: WizardStepId) => {
    const targetIndex = WIZARD_STEPS.findIndex(s => s.id === stepId)
    if (targetIndex === -1) return

    // If moving forward, validate current step
    if (targetIndex > currentStepIndex) {
      const isValid = await validateStep(currentStepIndex)
      if (!isValid) return
    }

    router.push(`${pathname}?step=${stepId}`, { scroll: true })
  }

  const nextStep = async () => {
    if (isLastStep) return
    const isValid = await validateStep(currentStepIndex)
    if (isValid) {
      router.push(`${pathname}?step=${WIZARD_STEPS[currentStepIndex + 1].id}`, { scroll: true })
    }
  }

  const prevStep = () => {
    if (isFirstStep) return
    router.push(`${pathname}?step=${WIZARD_STEPS[currentStepIndex - 1].id}`, { scroll: true })
  }

  return {
    form,
    currentStepIndex,
    currentStepId,
    steps: WIZARD_STEPS,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    campaign,
    isEdit: Boolean(campaign),
    isDirty,
    Provider: WizardContext.Provider,
  }
}
