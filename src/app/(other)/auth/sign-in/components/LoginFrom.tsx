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
            <Link
              href={`${process.env.NEXT_PUBLIC_AUTH_WEB_URL || 'https://auth.worldpetsassociation.com'}/auth/forgot-password`}
              target="_blank"
              rel="noopener noreferrer"
              className="float-end text-muted text-unline-dashed ms-1">
              Forgot password?
            </Link>
            <label className="form-label" htmlFor="password-id">
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
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </div>

      <p className="mt-3 fw-semibold no-span">OR</p>

      <div className="d-grid gap-2">
        <Button variant="outline-secondary" type="button" disabled={ssoLoading} onClick={loginWithCentralAuth}>
          {ssoLoading ? 'Redirecting…' : 'Continue with Central Authentication'}
        </Button>
      </div>
    </form>
  )
}

export default LoginFrom
