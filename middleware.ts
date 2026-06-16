import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env['NEXTAUTH_SECRET'],
  })

  const { pathname } = request.nextUrl

  // Not authenticated or session expired → redirect to sign-in
  if (!token || token.error === 'RefreshTokenExpired') {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Core admin
    '/dashboard/:path*',
    '/analytics/:path*',
    // CMS
    '/cms/:path*',
    // Community
    '/members/:path*',
    '/volunteers/:path*',
    '/contacts/:path*',
    // Administration
    '/users/:path*',
    '/roles/:path*',
    '/permissions/:path*',
    // Assets & Config
    '/media/:path*',
    '/seo/:path*',
    '/site-settings/:path*',
    '/settings/:path*',
    // Campaigns
    '/campaigns/:path*',
    '/doctors/:path*',
    '/pets/:path*',
    '/locations/:path*',
    // Community Care Fund
    '/community-care/:path*',
    // Payments & Logs
    '/payments/:path*',
    '/logs/:path*',
    '/sms-logs/:path*',
    '/email-logs/:path*',
  ],
}
