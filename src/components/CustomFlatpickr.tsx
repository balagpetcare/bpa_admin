'use client'
import Flatpickr from "react-flatpickr";

type FlatpickrProps = {
  className?: string
  value?: Date | [Date, Date]
  options?: Record<string, unknown>
  placeholder?: string
  onChange?: (selectedDates: Date[], dateStr: string, instance: unknown) => void
}

const CustomFlatpickr = ({ className, value, options, placeholder, onChange }: FlatpickrProps) => {
  return (
    <>
      <Flatpickr
        className={className}
        data-enable-time
        value={value ?? ''}
        options={options}
        placeholder={placeholder}
        onChange={onChange}
      />
    </>
  )
}

export default CustomFlatpickr
