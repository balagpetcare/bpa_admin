'use client'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

interface ConfirmOptions {
  title?: string
  text?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

// Shows a sweetalert2 confirmation dialog. Returns true if the user confirmed.
export async function confirmDialog(opts: ConfirmOptions = {}): Promise<boolean> {
  const {
    title = 'Are you sure?',
    text = 'This action cannot be undone.',
    confirmText = 'Yes, proceed',
    cancelText = 'Cancel',
    variant = 'danger',
  } = opts

  const colorMap = { danger: '#ef5f5f', warning: '#f9b931', info: '#4ecac2' }

  const result = await MySwal.fire({
    title,
    text,
    icon: variant === 'danger' ? 'warning' : variant,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: colorMap[variant],
    reverseButtons: true,
  })

  return result.isConfirmed
}

// Convenience helper for delete confirmations
export async function confirmDelete(itemName = 'this item'): Promise<boolean> {
  return confirmDialog({
    title: 'Delete ' + itemName + '?',
    text: 'This will permanently delete the record.',
    confirmText: 'Delete',
    variant: 'danger',
  })
}
