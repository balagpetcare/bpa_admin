'use client'
import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import smallImg from '@/assets/images/small/img-10.jpg'
import Image from 'next/image'
import LoginFrom from './LoginFrom'
import { Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const SignIn = () => {
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get('reason') === 'session_expired'
  // next-auth appends its own generic error codes (never Central Auth's own
  // error text) to the sign-in URL on a failed OAuth callback.
  const ssoError = searchParams.get('error')

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
                      <Image src={logoDark} height={24} alt="Bangladesh Pet Association" />
                    </Link>
                    <Link href="/dashboard" className="logo-light">
                      <Image src={logoLight} height={24} alt="Bangladesh Pet Association" />
                    </Link>
                  </div>
                  <h2 className="fw-bold fs-24">Sign In</h2>
                  <p className="text-muted mt-1 mb-4">Enter your email address and password to access BPA Admin.</p>

                  {sessionExpired && (
                    <div className="alert alert-warning py-2" role="alert">
                      Your session expired. Please sign in again.
                    </div>
                  )}
                  {ssoError && (
                    <div className="alert alert-danger py-2" role="alert">
                      Sign-in was unsuccessful. Please try again.
                    </div>
                  )}

                  <div className="mb-5">
                    <LoginFrom />
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xxl={5} className="d-none d-xxl-flex">
            <Card className="h-100 mb-0 overflow-hidden">
              <div className="d-flex flex-column h-100">
                <Image src={smallImg} alt="BPA Admin" className="w-100 h-100" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SignIn
