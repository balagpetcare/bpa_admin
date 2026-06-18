'use client'

import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import PurposeForm from '../components/PurposeForm'
import { listPurposes } from '@/lib/api/donations.api'

export default function EditPurposePage() {
  const { id } = useParams<{ id: string }>()
  const fn = useCallback(() => listPurposes(), [])
  const { data: purposes, loading } = useApi(fn, [id])
  const purpose = purposes?.find((p) => p.id === id)

  if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary" /></div>
  if (!purpose) return null

  return <PurposeForm purposeId={id} initial={purpose} />
}
