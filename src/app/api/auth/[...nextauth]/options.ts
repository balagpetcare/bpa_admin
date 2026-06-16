import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { JWT } from 'next-auth/jwt'

const BACKEND_API_URL = process.env['BACKEND_API_URL']

if (!BACKEND_API_URL && process.env['NODE_ENV'] === 'production') {
  throw new Error(
    'BACKEND_API_URL environment variable must be set in production. ' +
    'Example: https://api.bpa.org.bd/api/v1',
  )
}

const BACKEND_API = BACKEND_API_URL ?? 'http://localhost:4000/api/v1'

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${BACKEND_API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      return { ...token, error: 'RefreshTokenExpired' }
    }

    return {
      ...token,
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken ?? token.refreshToken,
      accessTokenExpires: json.data.accessTokenExpires,
      error: undefined,
    }
  } catch {
    return { ...token, error: 'RefreshTokenExpired' }
  }
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'BPA Admin',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const res = await fetch(`${BACKEND_API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message ?? 'Invalid credentials')
        }

        const { user, accessToken, refreshToken, accessTokenExpires } = json.data

        // Permissions are intentionally excluded from the session token.
        // Including them (~32 KB for super_admin) produces a JWT that exceeds
        // the 4 KB cookie limit, causing Nginx 502 errors.
        // Permissions are loaded on-demand via /api/proxy/permissions when needed.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles ?? [],
          accessToken,
          refreshToken,
          accessTokenExpires,
        }
      },
    }),
  ],

  secret: process.env['NEXTAUTH_SECRET'],

  pages: {
    signIn: '/auth/sign-in',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          user: {
            id: user.id,
            name: user.name ?? '',
            email: user.email ?? '',
            roles: user.roles,
          },
        }
      }

      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token
      }

      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      session.user = token.user
      return session
    },
  },
}
