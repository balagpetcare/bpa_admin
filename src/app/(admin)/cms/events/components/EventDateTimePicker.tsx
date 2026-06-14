'use client'

import { Form } from 'react-bootstrap'
import CustomFlatpickr from '@/components/CustomFlatpickr'

interface EventDateTimePickerProps {
  label: string
  value: string | null | undefined
  onChange: (iso: string | null) => void
  required?: boolean
  error?: string
  minDate?: string
}

export default function EventDateTimePicker({ label, value, onChange, required, error, minDate }: EventDateTimePickerProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <CustomFlatpickr
        className={`form-control${error ? ' is-invalid' : ''}`}
        placeholder="Select date & time…"
        value={value ? new Date(value) : undefined}
        options={{
          enableTime: true,
          dateFormat: 'Y-m-d H:i',
          allowInput: true,
          minDate: minDate ?? undefined,
        }}
        onChange={(dates: Date[]) => onChange(dates[0]?.toISOString() ?? null)}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  )
}
