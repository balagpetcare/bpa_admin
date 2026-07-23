'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { getApiOrigin } from '@/lib/utils/api-url'

// ─── Types ────────────────────────────────────────────────────────

interface PetSummary {
  id: string
  name: string
  petType: string
  breed: string | null
}

interface ServiceSummary {
  id: string
  name: string | undefined
  isRequired: boolean | undefined
}

interface CertSummary {
  id: string
  certificateNumber: string
  verifyToken: string
  issuedAt: string
}

interface PetBookingSummary {
  id: string
  pet: PetSummary | null
  services: ServiceSummary[]
  status: string
  checkedInAt: string | null
  vaccinatedAt: string | null
  certificate: CertSummary | null
  actions: {
    canCheckIn: boolean
    canMarkVaccinated: boolean
    canIssueCertificate: boolean
  }
}

interface ScanData {
  bookingNumber: string
  status: string
  campaign: { id: string; title: string } | null
  session: {
    sessionDate: string
    startTime: string
    endTime: string
    venue: { name: string; address: string | null } | null
  } | null
  owner: { ownerName: string; mobile: string; email: string | null } | null
  totalAmountBdt: string | number
  paymentStatus: string
  isPaid: boolean
  petBookings: PetBookingSummary[]
  summary: { allCheckedIn: boolean; allVaccinated: boolean; allCertIssued: boolean }
  allowedActions: {
    canReceivePayment: boolean
    canCheckIn: boolean
    canMarkVaccinated: boolean
    canIssueCertificates: boolean
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

function fmt12(t: string) {
  if (!t) return ''
  const parts = t.split(':').map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function fmtDate(val: string | null | undefined) {
  if (!val) return '—'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ label, variant }: { label: string; variant: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[variant]}`}>{label}</span>
}

function ActionButton({
  label,
  onClick,
  loading,
  disabled,
  variant = 'primary',
}: {
  label: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}) {
  const colors = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${colors[variant]}`}>
      {loading ? 'Please wait…' : label}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function CampaignScanPage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [data, setData] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const CERT_BASE = getApiOrigin()

  const fetchScan = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<ScanData>(`/admin/campaign-registrations/scan/${token}`)
      setData(result as unknown as ScanData)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchScan()
  }, [fetchScan])

  async function handleAction(action: string, successText: string) {
    setActionLoading(action)
    setSuccessMsg(null)
    setError(null)
    try {
      const result = await api.post<ScanData>(`/admin/campaign-registrations/scan/${token}/${action}`, {})
      const updated = result as unknown as { booking?: ScanData }
      setData(updated.booking ?? (result as unknown as ScanData))
      setSuccessMsg(successText)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Action failed: ${action}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading booking…</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-red-200 p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">❌</span>
          </div>
          <h2 className="font-bold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button type="button" onClick={fetchScan} className="text-sm text-blue-600 underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { bookingNumber, campaign, session, owner, totalAmountBdt, isPaid, petBookings, allowedActions, summary } = data

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#0f2d59] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">BPA Staff Check-In</p>
            <p className="font-mono font-extrabold text-white text-lg tracking-wider">{bookingNumber}</p>
          </div>
          <button type="button" onClick={fetchScan} className="text-xs text-blue-300 underline">
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Success message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-semibold">✓ {successMsg}</div>
        )}

        {/* Error message */}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">{error}</div>}

        {/* Status badges */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Booking Status</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={isPaid ? (data.paymentStatus === 'success' ? 'PAID ONLINE' : 'PAID AT CENTER') : 'PAY AT CENTER'}
              variant={isPaid ? 'green' : 'amber'}
            />
            <StatusBadge label={summary.allCheckedIn ? 'Checked In' : 'Not Checked In'} variant={summary.allCheckedIn ? 'blue' : 'gray'} />
            <StatusBadge label={summary.allVaccinated ? 'Vaccinated' : 'Pending Vaccination'} variant={summary.allVaccinated ? 'green' : 'gray'} />
            <StatusBadge label={summary.allCertIssued ? 'Certificate Issued' : 'No Certificate'} variant={summary.allCertIssued ? 'green' : 'gray'} />
          </div>
        </div>

        {/* Payment warning */}
        {!isPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-0.5">Payment Pending</p>
            <p>
              Collect payment at center before completing vaccination. Amount due:{' '}
              <strong>BDT {Number(String(totalAmountBdt)).toLocaleString()}</strong>
            </p>
          </div>
        )}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
            Payment completed{data.paymentStatus === 'success' ? ' online' : ' at center'}. Do not collect payment again.
          </div>
        )}

        {/* Owner info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Owner</p>
          <p className="font-bold text-gray-800">{owner?.ownerName}</p>
          {owner?.mobile && (
            <a href={`tel:${owner.mobile}`} className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm mt-0.5">
              📞 {owner.mobile}
            </a>
          )}
          {owner?.email && <p className="text-xs text-gray-500 mt-0.5">{owner.email}</p>}
        </div>

        {/* Campaign + Session */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign</p>
          <p className="font-bold text-gray-800 text-sm">{campaign?.title}</p>
          {session && (
            <div className="mt-2 text-sm text-gray-600">
              <p>📍 {session.venue?.name ?? '—'}</p>
              <p>
                📅 {fmtDate(session.sessionDate)} · {fmt12(session.startTime)}–{fmt12(session.endTime)}
              </p>
            </div>
          )}
          <p className="text-sm font-bold text-gray-700 mt-2">Total: BDT {Number(String(totalAmountBdt)).toLocaleString()}</p>
        </div>

        {/* Pet bookings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pets ({petBookings.length})</p>
          <div className="space-y-3">
            {petBookings.map((pb) => (
              <div key={pb.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {pb.pet?.name} — {pb.pet?.petType}
                    </p>
                    {pb.pet?.breed && <p className="text-xs text-gray-500">{pb.pet.breed}</p>}
                  </div>
                  <StatusBadge
                    label={pb.status.replace(/_/g, ' ').toUpperCase()}
                    variant={
                      pb.status === 'vaccinated' || pb.status === 'certificate_issued' || pb.status === 'completed'
                        ? 'green'
                        : pb.status === 'checked_in'
                          ? 'blue'
                          : pb.status === 'paid'
                            ? 'green'
                            : 'amber'
                    }
                  />
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  {pb.services
                    .filter((s) => s.name)
                    .map((s) => (
                      <span key={s.id} className="inline-block mr-2">
                        · {s.name}
                        {s.isRequired ? '' : ' (opt)'}
                      </span>
                    ))}
                </div>
                {pb.checkedInAt && <p className="text-xs text-blue-600 mt-1">✓ Checked in {fmtDate(pb.checkedInAt)}</p>}
                {pb.vaccinatedAt && <p className="text-xs text-green-600 mt-0.5">✓ Vaccinated {fmtDate(pb.vaccinatedAt)}</p>}
                {pb.certificate && (
                  <a
                    href={`${CERT_BASE}/api/v1/public/campaigns/certificate-pdf/${pb.certificate.verifyToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline mt-0.5 block">
                    📄 Certificate #{pb.certificate.certificateNumber}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Actions</p>
          <div className="space-y-2.5">
            {allowedActions.canReceivePayment && (
              <ActionButton
                label={`Receive Payment — BDT ${Number(String(totalAmountBdt)).toLocaleString()}`}
                variant="warning"
                loading={actionLoading === 'receive-payment'}
                onClick={() => handleAction('receive-payment', 'Payment received and recorded.')}
              />
            )}

            {allowedActions.canCheckIn && (
              <ActionButton
                label="Check In All Pets"
                variant="primary"
                loading={actionLoading === 'check-in'}
                onClick={() => handleAction('check-in', 'Checked in successfully.')}
              />
            )}

            {allowedActions.canMarkVaccinated && (
              <ActionButton
                label="Mark All Pets Vaccinated"
                variant="success"
                loading={actionLoading === 'mark-vaccinated'}
                onClick={() => handleAction('mark-vaccinated', 'All pets marked as vaccinated.')}
              />
            )}

            {allowedActions.canIssueCertificates && (
              <ActionButton
                label="Generate Vaccination Certificates"
                variant="success"
                loading={actionLoading === 'generate-certificate'}
                onClick={() => handleAction('generate-certificate', 'Certificates generated.')}
              />
            )}

            {!allowedActions.canReceivePayment &&
              !allowedActions.canCheckIn &&
              !allowedActions.canMarkVaccinated &&
              !allowedActions.canIssueCertificates && (
                <p className="text-sm text-gray-500 text-center py-2">✓ All actions completed for this booking.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
