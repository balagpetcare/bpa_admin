'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    signIn('credentials', {
      redirect: false,
      email: values?.email,
      password: values?.password,
    }).then((res) => {
      if (res?.ok) {
        push(queryParams['redirectTo'] ?? '/dashboard')
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
      } else {
        showNotification({ message: res?.error ?? '', variant: 'danger' })
      }
    })
    setLoading(false)
  })

  // Generic account SSO via Central Auth (Global Super Admin role, checked
  // server-side by bpa/api — this button intentionally carries no
  // "admin-only" branding, matching the rest of the local sign-in form).
  // next-auth handles the redirect to Central Auth's login page itself; the
  // `redirectTo` query param is preserved through `callbackUrl` so the user
  // lands back where they intended after the round trip.
  const loginWithCentralAuth = () => {
    setSsoLoading(true)
    signIn('central-auth', { callbackUrl: queryParams['redirectTo'] ?? '/dashboard' })
  }

  return { loading, ssoLoading, login, loginWithCentralAuth, control }
}

export default useSignIn
