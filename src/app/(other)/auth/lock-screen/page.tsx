import { redirect } from 'next/navigation'

// This route used to render an unmodified Larkon template demo page
// ("Hi! Gaston", a non-functional password form with an empty onSubmit
// handler, and a dead-end "Sign Up" link) that useAuthError.ts redirected
// expired sessions to. That redirect now goes straight to /auth/sign-in;
// this route is kept only as a compatibility redirect for any old
// bookmarks/links, so it can never again show unrelated template branding
// or a dead-end form.
//
// force-dynamic: without this, Next prerenders the route statically at
// build time and redirect() only takes effect via client-side navigation
// (fine for browsers, invisible to a plain HTTP request/bot/scanner that
// doesn't execute JS). Forcing dynamic rendering makes this an actual
// HTTP 307 on every request.
export const dynamic = 'force-dynamic'

const LockScreenPage = () => {
  redirect('/auth/sign-in?reason=session_expired&redirectTo=/dashboard')
}

export default LockScreenPage
