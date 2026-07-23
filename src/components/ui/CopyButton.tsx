'use client'

import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'

interface CopyButtonProps {
  value: string
  size?: 'sm' | 'lg'
}

export default function CopyButton({ value, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant={copied ? 'success' : 'outline-secondary'} size={size} onClick={handleCopy} title="Copy to clipboard">
      <Icon icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} />
    </Button>
  )
}
