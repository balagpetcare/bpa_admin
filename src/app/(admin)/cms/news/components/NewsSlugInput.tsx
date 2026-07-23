'use client'

import { useState } from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

interface NewsSlugInputProps {
  value: string
  onChange: (slug: string) => void
  title: string // source title for auto-generation
}

export default function NewsSlugInput({ value, onChange, title }: NewsSlugInputProps) {
  const [locked, setLocked] = useState(!!value)

  const handleTitleSync = () => {
    if (!locked) {
      onChange(toSlug(title))
    }
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(toSlug(e.target.value))
  }

  const handleLockToggle = () => {
    const next = !locked
    setLocked(next)
    if (!next) onChange(toSlug(title))
  }

  // Expose sync function via onBlur on the title
  void handleTitleSync

  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">Slug</Form.Label>
      <InputGroup>
        <InputGroup.Text className="text-muted small">/</InputGroup.Text>
        <Form.Control value={value} onChange={handleManualChange} disabled={!locked} placeholder="auto-generated-from-title" />
        <Button
          variant={locked ? 'outline-primary' : 'outline-secondary'}
          onClick={handleLockToggle}
          title={locked ? 'Currently manual — click to auto-sync from title' : 'Currently auto — click to lock and edit manually'}>
          <Icon icon={locked ? 'solar:lock-keyhole-bold' : 'solar:lock-keyhole-unlocked-bold'} />
        </Button>
        {!locked && (
          <Button variant="outline-secondary" onClick={() => onChange(toSlug(title))} title="Regenerate from title">
            <Icon icon="solar:refresh-bold" />
          </Button>
        )}
      </InputGroup>
      <Form.Text className="text-muted">
        {locked ? 'Manual mode — edit slug directly.' : 'Auto mode — slug updates when you change the title.'}
      </Form.Text>
    </Form.Group>
  )
}

// Export helper so parent can call it
export { toSlug }
