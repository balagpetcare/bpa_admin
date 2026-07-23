'use client'
import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import smallImg from '@/assets/images/small/img-10.jpg'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Alert, Button, Card, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { apiClient } from '@/lib/api'

const schema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Please enter a new password'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
})

const NewPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      setErrorMsg('Reset token is missing. Please use the link from the email.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      await apiClient('/auth/password/reset', {
        method: 'POST',
        body: { token, password: data.password },
      })
      setSuccess(true)
      setTimeout(() => router.push('/auth/sign-in'), 3000)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired reset link. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column vh-100 p-3">
      <div className="d-flex flex-column flex-grow-1">
        <Row className="h-100">
          <Col xxl={7}>
            <Row className="justify-content-center h-100">
              <Col lg={6} className="py-lg-5">
                <div className="d-flex flex-column h-100 justify-content-center">
                  <div className="auth-logo mb-4">
                    <Link href="/dashboard" className="logo-dark">
                      <Image src={logoDark} height={24} alt="logo dark" />
                    </Link>
                    <Link href="/dashboard" className="logo-light">
                      <Image src={logoLight} height={24} alt="logo light" />
                    </Link>
                  </div>
                  <h2 className="fw-bold fs-24">Set New Password</h2>
                  <p className="text-muted mt-1 mb-4">Enter and confirm your new password below.</p>

                  {!token && <Alert variant="danger">Invalid reset link. Please go back and request a new password reset email.</Alert>}

                  {success ? (
                    <Alert variant="success">
                      <strong>Password updated!</strong> You will be redirected to the sign-in page shortly.
                    </Alert>
                  ) : token ? (
                    <div>
                      {errorMsg && (
                        <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>
                          {errorMsg}
                        </Alert>
                      )}
                      <form className="authentication-form" onSubmit={handleSubmit(onSubmit)}>
                        <TextFormInput
                          control={control}
                          name="password"
                          containerClassName="mb-3"
                          label="New Password"
                          id="password-id"
                          placeholder="At least 8 characters"
                          type="password"
                        />
                        <TextFormInput
                          control={control}
                          name="confirmPassword"
                          containerClassName="mb-3"
                          label="Confirm New Password"
                          id="confirm-password-id"
                          placeholder="Re-enter your new password"
                          type="password"
                        />
                        <div className="mb-1 text-center d-grid">
                          <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Set New Password'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  <p className="mt-5 text-center">
                    Back to{' '}
                    <Link href="/auth/sign-in" className="text-dark fw-bold ms-1">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xxl={5} className="d-none d-xxl-flex">
            <Card className="h-100 mb-0 overflow-hidden">
              <div className="d-flex flex-column h-100">
                <Image src={smallImg} height={867} width={759} alt="small-img" className="w-100 h-100" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default NewPassword
