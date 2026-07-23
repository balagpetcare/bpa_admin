'use client'

/**
 * Cascading location selector for the BPA admin panel.
 * Uses Bootstrap styling (react-bootstrap is available in bpa_admin).
 *
 * API shape mirrors the public endpoint: GET /api/v1/public/locations?type=X&parentId=Y
 */

import React, { useCallback, useEffect, useState } from 'react'
import { getApiBase } from '@/lib/utils/api-url'

// ── Types ──────────────────────────────────────────────────────────────────────

export type LocationType = 'DIVISION' | 'DISTRICT' | 'UPAZILA' | 'THANA' | 'UNION' | 'POURASHAVA' | 'CITY_CORPORATION' | 'CITY_ZONE' | 'WARD' | 'AREA'

export interface LocationOption {
  id: string
  nameEn: string
  nameBn: string | null
  slug: string
  type: LocationType
}

export interface LocationValue {
  divisionId?: string
  districtId?: string
  upazilaId?: string
  unionId?: string
  cityCorporationId?: string
  cityZoneId?: string
  wardId?: string
  addressLine?: string
}

export interface LocationSelectorProps {
  value?: LocationValue
  onChange?: (value: LocationValue) => void
  showDivision?: boolean
  showDistrict?: boolean
  showUpazila?: boolean
  showUnion?: boolean
  showCityCorporation?: boolean
  showZone?: boolean
  showWard?: boolean
  showAddressLine?: boolean
  locale?: 'en' | 'bn'
  requiredLevels?: LocationType[]
  disabled?: boolean
  /** Bootstrap column span per field on desktop (md breakpoint). Defaults to
   * 6 (2 per row) — pass 4 for a denser 3-per-row filter panel. Layout-only,
   * cascading behavior is unaffected. */
  columnsMd?: 4 | 6
}

// ── API ────────────────────────────────────────────────────────────────────────

const BASE_URL = getApiBase()

async function fetchLocations(type?: LocationType, parentId?: string): Promise<LocationOption[]> {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (parentId) params.set('parentId', parentId)
  try {
    const res = await fetch(`${BASE_URL}/public/locations?${params.toString()}`)
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

// ── Label helper ───────────────────────────────────────────────────────────────

const LABELS: Record<string, { en: string; bn: string }> = {
  division: { en: 'Division', bn: 'বিভাগ' },
  district: { en: 'District', bn: 'জেলা' },
  upazila: { en: 'Upazila / Thana', bn: 'উপজেলা / থানা' },
  cityCorporation: { en: 'City Corporation', bn: 'সিটি কর্পোরেশন' },
  zone: { en: 'Zone', bn: 'জোন' },
  ward: { en: 'Ward', bn: 'ওয়ার্ড' },
  union: { en: 'Union', bn: 'ইউনিয়ন' },
  addressLine: { en: 'Address Line', bn: 'ঠিকানা' },
}

function lbl(key: string, locale: 'en' | 'bn'): string {
  return LABELS[key]?.[locale] ?? key
}

// ── Select field ───────────────────────────────────────────────────────────────

function LSelect({
  id,
  labelText,
  options,
  value,
  onChange,
  loading,
  required,
  disabled,
}: {
  id: string
  labelText: string
  options: LocationOption[]
  value: string
  onChange: (val: string) => void
  loading?: boolean
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold small">
        {labelText}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <select
        id={id}
        className="form-select form-select-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || loading || options.length === 0}>
        <option value="">{loading ? 'Loading…' : options.length === 0 ? '—' : `Select ${labelText}`}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.nameEn}
            {opt.nameBn ? ` (${opt.nameBn})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LocationSelector({
  value = {},
  onChange,
  showDivision = true,
  showDistrict = true,
  showUpazila = true,
  showUnion = true,
  showCityCorporation = true,
  showZone = true,
  showWard = true,
  showAddressLine = false,
  locale = 'en',
  requiredLevels = [],
  disabled = false,
  columnsMd = 6,
}: LocationSelectorProps) {
  const isRequired = (t: LocationType) => requiredLevels.includes(t)
  const colClass = columnsMd === 4 ? 'col-12 col-md-4' : 'col-12 col-md-6'

  const [divisions, setDivisions] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<LocationOption[]>([])
  const [upazilas, setUpazilas] = useState<LocationOption[]>([])
  const [corps, setCorps] = useState<LocationOption[]>([])
  const [zones, setZones] = useState<LocationOption[]>([])
  const [wards, setWards] = useState<LocationOption[]>([])
  const [unions, setUnions] = useState<LocationOption[]>([])

  const [loadingDiv, setLoadingDiv] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)
  const [loadingUp, setLoadingUp] = useState(false)
  const [loadingCorp, setLoadingCorp] = useState(false)
  const [loadingZone, setLoadingZone] = useState(false)
  const [loadingWard, setLoadingWard] = useState(false)
  const [loadingUnion, setLoadingUnion] = useState(false)

  const emit = useCallback((patch: Partial<LocationValue>) => onChange?.({ ...value, ...patch }), [onChange, value])

  useEffect(() => {
    if (!showDivision) return
    setLoadingDiv(true)
    fetchLocations('DIVISION').then((d) => {
      setDivisions(d)
      setLoadingDiv(false)
    })
  }, [showDivision])

  useEffect(() => {
    setDistricts([])
    if (!value.divisionId || !showDistrict) return
    setLoadingDist(true)
    fetchLocations('DISTRICT', value.divisionId).then((d) => {
      setDistricts(d)
      setLoadingDist(false)
    })
  }, [value.divisionId, showDistrict])

  useEffect(() => {
    setUpazilas([])
    setCorps([])
    if (!value.districtId) return
    if (showUpazila) {
      setLoadingUp(true)
      fetchLocations('UPAZILA', value.districtId).then((d) => {
        setUpazilas(d)
        setLoadingUp(false)
      })
    }
    if (showCityCorporation) {
      setLoadingCorp(true)
      fetchLocations('CITY_CORPORATION', value.districtId).then((d) => {
        setCorps(d)
        setLoadingCorp(false)
      })
    }
  }, [value.districtId, showUpazila, showCityCorporation])

  useEffect(() => {
    setZones([])
    setWards([])
    if (!value.cityCorporationId || !showZone) return
    setLoadingZone(true)
    fetchLocations('CITY_ZONE', value.cityCorporationId).then((d) => {
      setZones(d)
      setLoadingZone(false)
    })
  }, [value.cityCorporationId, showZone])

  useEffect(() => {
    setWards([])
    if (!value.cityZoneId || !showWard) return
    setLoadingWard(true)
    fetchLocations('WARD', value.cityZoneId).then((d) => {
      setWards(d)
      setLoadingWard(false)
    })
  }, [value.cityZoneId, showWard])

  useEffect(() => {
    setUnions([])
    if (!value.upazilaId || !showUnion) return
    setLoadingUnion(true)
    fetchLocations('UNION', value.upazilaId).then((d) => {
      setUnions(d)
      setLoadingUnion(false)
    })
  }, [value.upazilaId, showUnion])

  return (
    <div className="row g-2">
      {showDivision && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-division"
            labelText={lbl('division', locale)}
            options={divisions}
            value={value.divisionId ?? ''}
            onChange={(id) =>
              emit({
                divisionId: id || undefined,
                districtId: undefined,
                upazilaId: undefined,
                unionId: undefined,
                cityCorporationId: undefined,
                cityZoneId: undefined,
                wardId: undefined,
              })
            }
            loading={loadingDiv}
            required={isRequired('DIVISION')}
            disabled={disabled}
          />
        </div>
      )}

      {showDistrict && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-district"
            labelText={lbl('district', locale)}
            options={districts}
            value={value.districtId ?? ''}
            onChange={(id) =>
              emit({
                districtId: id || undefined,
                upazilaId: undefined,
                unionId: undefined,
                cityCorporationId: undefined,
                cityZoneId: undefined,
                wardId: undefined,
              })
            }
            loading={loadingDist}
            required={isRequired('DISTRICT')}
            disabled={disabled || !value.divisionId}
          />
        </div>
      )}

      {showUpazila && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-upazila"
            labelText={lbl('upazila', locale)}
            options={upazilas}
            value={value.upazilaId ?? ''}
            onChange={(id) =>
              emit({
                upazilaId: id || undefined,
                unionId: undefined,
              })
            }
            loading={loadingUp}
            required={isRequired('UPAZILA')}
            disabled={disabled || !value.districtId}
          />
        </div>
      )}

      {showCityCorporation && corps.length > 0 && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-corp"
            labelText={lbl('cityCorporation', locale)}
            options={corps}
            value={value.cityCorporationId ?? ''}
            onChange={(id) =>
              emit({
                cityCorporationId: id || undefined,
                cityZoneId: undefined,
                wardId: undefined,
              })
            }
            loading={loadingCorp}
            required={isRequired('CITY_CORPORATION')}
            disabled={disabled}
          />
        </div>
      )}

      {showZone && zones.length > 0 && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-zone"
            labelText={lbl('zone', locale)}
            options={zones}
            value={value.cityZoneId ?? ''}
            onChange={(id) =>
              emit({
                cityZoneId: id || undefined,
                wardId: undefined,
              })
            }
            loading={loadingZone}
            required={isRequired('CITY_ZONE')}
            disabled={disabled || !value.cityCorporationId}
          />
        </div>
      )}

      {showWard && wards.length > 0 && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-ward"
            labelText={lbl('ward', locale)}
            options={wards}
            value={value.wardId ?? ''}
            onChange={(id) => emit({ wardId: id || undefined })}
            loading={loadingWard}
            required={isRequired('WARD')}
            disabled={disabled || !value.cityZoneId}
          />
        </div>
      )}

      {showUnion && unions.length > 0 && (
        <div className={colClass}>
          <LSelect
            id="admin-loc-union"
            labelText={lbl('union', locale)}
            options={unions}
            value={value.unionId ?? ''}
            onChange={(id) => emit({ unionId: id || undefined })}
            loading={loadingUnion}
            required={isRequired('UNION')}
            disabled={disabled || !value.upazilaId}
          />
        </div>
      )}

      {showAddressLine && (
        <div className="col-12">
          <div className="mb-3">
            <label htmlFor="admin-loc-address" className="form-label fw-semibold small">
              {lbl('addressLine', locale)}
            </label>
            <input
              id="admin-loc-address"
              type="text"
              className="form-control form-control-sm"
              value={value.addressLine ?? ''}
              onChange={(e) => emit({ addressLine: e.target.value || undefined })}
              disabled={disabled}
              placeholder={locale === 'bn' ? 'বাড়ি নং, রোড, এলাকা…' : 'House no., Road, Area…'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
