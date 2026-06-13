import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env['NEXTAUTH_SECRET'],
  })

  const { pathname } = request.nextUrl

  // Not authenticated or session expired
  if (!token || token.error === 'RefreshTokenExpired') {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cms/:path*',
    '/users/:path*',
    '/roles/:path*',
    '/volunteers/:path*',
    '/contacts/:path*',
    '/media/:path*',
    '/seo/:path*',
    '/analytics/:path*',
    '/payments/:path*',
    '/logs/:path*',
    '/members/:path*',
  ],
}
