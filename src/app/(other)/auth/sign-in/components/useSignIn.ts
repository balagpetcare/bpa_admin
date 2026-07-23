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

  // Credentials are verified entirely by Central Auth (see
  // loginWithCentralAuthPassword in options.ts) — this app never checks a
  // password itself.
  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      const res = await signIn('central-auth-password', {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (res?.ok) {
        push(queryParams['redirectTo'] ?? '/dashboard')
        showNotification({ message: 'Successfully logged in. Redirecting...', variant: 'success' })
      } else {
        showNotification({ message: 'Invalid email or password.', variant: 'danger' })
      }
    } finally {
      setLoading(false)
    }
  })

  // Fallback: full OAuth redirect through Central Auth's hosted login page.
  const loginWithCentralAuth = () => {
    setSsoLoading(true)
    signIn('central-auth', { callbackUrl: queryParams['redirectTo'] ?? '/dashboard' })
  }

  return { loading, ssoLoading, login, loginWithCentralAuth, control }
}

export default useSignIn
