import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getContentSecurityPolicy } from './media-config.mjs'

const authRequiredPaths = [
  '/dashboard', '/analytics', '/cms', '/members', '/volunteers', '/contacts',
  '/users', '/roles', '/permissions', '/media', '/seo', '/site-settings',
  '/settings', '/campaigns', '/doctors', '/pets', '/locations', '/donations',
  '/community-care', '/payments', '/logs', '/sms-logs', '/email-logs', '/campaign-scan'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const nonce = crypto.randomUUID()
  const csp = getContentSecurityPolicy(process.env, nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const isAuthRequired = authRequiredPaths.some(p => pathname.startsWith(p))

  if (isAuthRequired) {
    const token = await getToken({
      req: request,
      secret: process.env['NEXTAUTH_SECRET'],
    })

    if (!token || token.error === 'RefreshTokenExpired') {
      const signInUrl = new URL('/auth/sign-in', request.url)
      signInUrl.searchParams.set('redirectTo', pathname)
      response = NextResponse.redirect(signInUrl)
    }
  }

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
