'use client'
import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import smallImg from '@/assets/images/small/img-10.jpg'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Alert, Button, Card, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { apiClient } from '@/lib/api'

const resetPasswordSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Please enter your email'),
})

const ResetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    setErrorMsg('')
    try {
      await apiClient('/auth/password/forgot', {
        method: 'POST',
        body: { email: data.email },
      })
      setSuccess(true)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.')
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
                  <h2 className="fw-bold fs-24">Forgot Password</h2>
                  <p className="text-muted mt-1 mb-4">Enter your email address and we&apos;ll send you instructions to reset your password.</p>

                  {success ? (
                    <Alert variant="success">
                      <strong>Email sent!</strong> If an account exists for that email, you will receive a reset link shortly. Please check your
                      inbox.
                    </Alert>
                  ) : (
                    <div>
                      {errorMsg && (
                        <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>
                          {errorMsg}
                        </Alert>
                      )}
                      <form className="authentication-form" onSubmit={handleSubmit(onSubmit)}>
                        <TextFormInput
                          control={control}
                          name="email"
                          containerClassName="mb-3"
                          label="Email Address"
                          id="email-id"
                          placeholder="Enter your registered email"
                        />
                        <div className="mb-1 text-center d-grid">
                          <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

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

export default ResetPassword
