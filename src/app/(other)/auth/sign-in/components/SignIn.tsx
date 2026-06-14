'use client'
import smallImg from '@/assets/images/small/img-10.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import LoginFrom from './LoginFrom'
import { Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'

const BpaAuthLogo = () => (
  <div className="d-flex align-items-center gap-2">
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-label="BPA">
      <circle cx="18" cy="18" r="18" fill="#1a6e38" />
      <text x="18" y="24" textAnchor="middle" fill="white" fontSize="11" fontFamily="Arial,sans-serif" fontWeight="700">BPA</text>
    </svg>
    <div style={{ lineHeight: 1.15 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3c4d' }}>Bangladesh Pet Association</div>
      <div style={{ fontSize: 11, color: '#6c757d' }}>Admin Dashboard</div>
    </div>
  </div>
)

const SignIn = () => {
  return (
    <div className="d-flex flex-column vh-100 p-3">
      <div className="d-flex flex-column flex-grow-1">
        <Row className="h-100">
          <Col xxl={7}>
            <Row className="justify-content-center h-100">
              <Col lg={6} className="py-lg-5">
                <div className="d-flex flex-column h-100 justify-content-center">
                  <div className="auth-logo mb-4">
                    <Link href="/dashboard">
                      <BpaAuthLogo />
                    </Link>
                  </div>
                  <h2 className="fw-bold fs-24">Sign In</h2>
                  <p className="text-muted mt-1 mb-4">Enter your email address and password to access admin panel.</p>
                  <div className="mb-5">
                    <LoginFrom />
                    <p className="mt-3 fw-semibold no-span">OR sign with</p>
                    <div className="d-grid gap-2">
                      <Link href="" className="btn btn-soft-dark">
                        <IconifyIcon icon="bxl:google" className="fs-20 me-1" /> Sign in with Google
                      </Link>
                      <Link href="" className="btn btn-soft-primary">
                        <IconifyIcon icon="bxl:facebook" className="fs-20 me-1" /> Sign in with Facebook
                      </Link>
                    </div>
                  </div>
                  <p className="text-danger text-center">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/sign-up" className="text-dark fw-bold ms-1">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xxl={5} className="d-none d-xxl-flex">
            <Card className="h-100 mb-0 overflow-hidden">
              <div className="d-flex flex-column h-100">
                <Image src={smallImg} alt="small-img" className="w-100 h-100" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SignIn
