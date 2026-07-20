'use client'
import TextFormInput from '@/components/form/TextFormInput'
import Link from 'next/link'
import { Button, FormCheck } from 'react-bootstrap'
import useSignIn from './useSignIn'
import PasswordFormInput from '@/components/form/PasswordFormInput'

const LoginFrom = () => {
  const { loading, ssoLoading, login, loginWithCentralAuth, control } = useSignIn()
  return (
    <form className="authentication-form" onSubmit={login}>
      <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email" id="email-id" placeholder="Enter your email" />

      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label={
          <>
            <Link href="/auth/reset-pass" className="float-end text-muted text-unline-dashed ms-1">
              Forgot password?
            </Link>
            <label className="form-label" htmlFor="example-password">
              Password
            </label>
          </>
        }
      />
      <div className="mb-3">
        <FormCheck label="Remember me" id="sign-in" />
      </div>
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          Sign In
        </Button>
      </div>

      <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1" />
        <span className="mx-2 text-muted" style={{ fontSize: 12 }}>
          or
        </span>
        <hr className="flex-grow-1" />
      </div>

      <div className="mb-1 text-center d-grid">
        <Button variant="outline-secondary" type="button" disabled={ssoLoading} onClick={loginWithCentralAuth}>
          {ssoLoading ? 'Redirecting…' : 'Sign in with WPA Central Auth'}
        </Button>
      </div>
    </form>
  )
}

export default LoginFrom
