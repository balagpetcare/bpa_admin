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

/**
 * The backend never returns a ready-made expiry timestamp — both
 * /auth/login and /auth/refresh send `expiresIn` as an env-style duration
 * string (e.g. "15m", "7d"; see bpa/api's JWT_ACCESS_EXPIRY and
 * src/modules/auth/utils/duration.util.ts parseDurationMs, which this
 * mirrors). Compute the absolute epoch-ms expiry ourselves from it.
 */
const DURATION_UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
}

function expiryFromNow(expiresIn: unknown): number {
  const spec = String(expiresIn ?? '').trim()
  const match = /^(\d+)(ms|s|m|h|d|w)$/i.exec(spec)
  if (match) {
    const amount = parseInt(match[1], 10)
    const unit = DURATION_UNIT_MS[match[2].toLowerCase()]
    if (unit) return Date.now() + amount * unit
  }
  // Fallback: treat as already-expired rather than silently caching forever.
  return Date.now()
}

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

    // /auth/refresh returns tokens flat on `data` (unlike /auth/login, which
    // nests them under `data.tokens` — see authorize() below).
    return {
      ...token,
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken ?? token.refreshToken,
      accessTokenExpires: expiryFromNow(json.data.expiresIn),
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

        // /auth/login nests tokens under `data.tokens` and returns a single
        // `role` string (not `roles`, not a top-level `name`) — see
        // AuthResponse / AuthUserResponse / AuthTokensResponse in
        // bpa/api's src/modules/auth/types/auth.interfaces.ts. The previous
        // version of this code destructured accessToken/refreshToken/
        // accessTokenExpires straight off `data`, which don't exist there,
        // so every login silently produced a session with no real tokens —
        // the very next jwt() callback treated it as already expired and
        // tried to refresh with an undefined refresh token, which fails
        // immediately (confirmed live: /api/auth/session showed
        // error: "RefreshTokenExpired" seconds after a correct-password
        // login). This is the confirmed root cause of the reported
        // login/session-expiry issue.
        const { user, tokens } = json.data
        const { accessToken, refreshToken, expiresIn } = tokens

        // Permissions are intentionally excluded from the session token.
        // Including them (~32 KB for super_admin) produces a JWT that exceeds
        // the 4 KB cookie limit, causing Nginx 502 errors.
        // Permissions are loaded on-demand via /api/proxy/permissions when needed.
        return {
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(' '),
          email: user.email,
          roles: user.role ? [user.role] : [],
          accessToken,
          refreshToken,
          accessTokenExpires: expiryFromNow(expiresIn),
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
