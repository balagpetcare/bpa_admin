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

/**
 * For irreversible, highest-privilege-only deletes (e.g. clinic organizations
 * and branches). Requires the admin to type the record's exact name/slug and
 * give a reason — both are sent to the API and stored in the audit log.
 * Returns null if the admin cancelled.
 */
export async function confirmPermanentDelete(
  expectedText: string,
  entityLabel = 'record',
): Promise<{ reason: string; confirmationText: string } | null> {
  const result = await MySwal.fire({
    title: `Permanently delete this ${entityLabel}?`,
    html: `This cannot be undone and is blocked if dependent records exist. Type <strong>${expectedText}</strong> to confirm, and give a reason.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Permanently delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef5f5f',
    reverseButtons: true,
    focusConfirm: false,
    preConfirm: () => {
      const confirmationText = (document.getElementById('swal-confirm-text') as HTMLInputElement | null)?.value?.trim() ?? ''
      const reason = (document.getElementById('swal-confirm-reason') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
      if (confirmationText !== expectedText) {
        Swal.showValidationMessage(`Type "${expectedText}" exactly to confirm`)
        return false
      }
      if (reason.length < 10) {
        Swal.showValidationMessage('Reason must be at least 10 characters')
        return false
      }
      return { confirmationText, reason }
    },
    didOpen: () => {
      const container = Swal.getHtmlContainer()
      if (!container) return
      const wrapper = document.createElement('div')
      wrapper.className = 'mt-3 text-start'
      wrapper.innerHTML = `
        <label class="form-label small fw-semibold mb-1">Type "${expectedText}" to confirm</label>
        <input id="swal-confirm-text" class="swal2-input" style="margin: 0 0 0.75rem 0; width: 100%;" />
        <label class="form-label small fw-semibold mb-1">Reason for permanent deletion</label>
        <textarea id="swal-confirm-reason" class="swal2-textarea" style="margin: 0; width: 100%;" rows="2"></textarea>
      `
      container.appendChild(wrapper)
    },
  });

  if (!result.isConfirmed || !result.value) return null;
  return result.value as { reason: string; confirmationText: string };
}
