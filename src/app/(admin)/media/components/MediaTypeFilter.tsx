'use client'

import { Nav } from 'react-bootstrap'

export type MediaFilterType = 'all' | 'image' | 'document' | 'video'

interface MediaTypeFilterProps {
  active: MediaFilterType
  onChange: (type: MediaFilterType) => void
}

const FILTERS: { key: MediaFilterType; label: string }[] = [
  { key: 'all', label: 'All Files' },
  { key: 'image', label: 'Images' },
  { key: 'document', label: 'Documents' },
  { key: 'video', label: 'Videos' },
]

export default function MediaTypeFilter({ active, onChange }: MediaTypeFilterProps) {
  return (
    <Nav variant="tabs" className="mb-3 border-bottom-0">
      {FILTERS.map((f) => (
        <Nav.Item key={f.key}>
          <Nav.Link active={active === f.key} onClick={() => onChange(f.key)} style={{ cursor: 'pointer' }}>
            {f.label}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  )
}
