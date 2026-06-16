import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { JWT } from 'next-auth/jwt'

const BACKEND_API_URL = process.env['BACKEND_API_URL']

// In production the app must not fall back to an HTTP localhost URL — credentials
// would be transmitted in plaintext. Fail loudly at startup if the var is absent.
if (!BACKEND_API_URL && process.env['NODE_ENV'] === 'production') {
  throw new Error(
    'BACKEND_API_URL environment variable must be set in production. ' +
    'Example: https://api.bpa.org.bd/api/v1',
  )
}

const BACKEND_API = BACKEND_API_URL ?? 'http://localhost:4000/api/v1'

// Attempt to refresh the access token using the stored refresh token
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

        let res: Response
        try {
          res = await fetch(`${BACKEND_API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
        } catch (err) {
          // Network error — backend unreachable
          throw new Error('Cannot reach authentication server. Please try again.')
        }

        let json: { success: boolean; data?: { user: { id: string; name: string; email: string; roles: string[] }; accessToken: string; refreshToken: string; accessTokenExpires: number }; error?: { message: string } }
        try {
          json = await res.json()
        } catch {
          throw new Error('Authentication server returned an invalid response.')
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message ?? 'Invalid credentials')
        }

        const { user, accessToken, refreshToken, accessTokenExpires } = json.data!

        // IMPORTANT: Do NOT include user.permissions here.
        // The permissions array can be very large (100+ entries) and will bloat
        // the NextAuth JWT cookie past the 4096-byte browser/Nginx limit → 502.
        // If the UI needs permissions, fetch them from /auth/me using the accessToken.
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
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: populate token from the user returned by authorize()
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          // Store only the minimal user identity — never include permissions array.
          // Large permission sets exceed cookie size limits and cause Nginx 502.
          user: {
            id: user.id,
            name: user.name ?? '',
            email: user.email ?? '',
            roles: user.roles ?? [],
          },
        }
      }

      // Token still valid with 60-second buffer
      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token
      }

      // Access token expired — attempt refresh
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
