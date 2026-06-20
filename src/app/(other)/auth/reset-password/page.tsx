export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
import { Suspense } from 'react'
import NewPassword from './components/NewPassword'

export const metadata: Metadata = { title: 'Set New Password' }

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <NewPassword />
    </Suspense>
  )
}
