import type { NextAuthOptions } from 'next-auth'
import type { OAuthConfig } from 'next-auth/providers/oauth'
import type { TokenSet } from 'openid-client'
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

// ─── WPA Central Auth (Global Super Admin SSO) ──────────────────────────────
//
// Central Auth's public OAuth surface is split across two hosts/paths:
//  - the *browser-facing* authorization page (a real login UI, not JSON):
//    https://auth.worldpetsassociation.com/oauth/authorize
//  - the *server-to-server* API, under /api/v1/oauth/*, used for the token
//    exchange, refresh, userinfo lookup and revoke.
// These are fixed, publicly documented endpoints of the central identity
// service (not per-deployment config), so they're hardcoded here rather than
// pulled from env — only the client_id/client_secret for *this* registered
// OAuth client are environment-specific.
const CENTRAL_AUTH_WEB_BASE = 'https://auth.worldpetsassociation.com'
const CENTRAL_AUTH_API_BASE = `${CENTRAL_AUTH_WEB_BASE}/api/v1`
const CENTRAL_AUTH_AUTHORIZATION_URL = `${CENTRAL_AUTH_WEB_BASE}/oauth/authorize`
const CENTRAL_AUTH_TOKEN_URL = `${CENTRAL_AUTH_API_BASE}/oauth/token`
const CENTRAL_AUTH_USERINFO_URL = `${CENTRAL_AUTH_API_BASE}/oauth/userinfo`
const CENTRAL_AUTH_REVOKE_URL = `${CENTRAL_AUTH_API_BASE}/oauth/revoke`

interface CentralAuthProfile {
  sub: string
  email: string | null
  preferred_username?: string | null
  name?: string | null
  roles?: string[]
}

/**
 * Central Auth's `/oauth/token` (wpa/auth-api, src/modules/oauth/
 * oauth.routes.ts + server.ts) only mounts `express.json()` — there is no
 * `express.urlencoded()` middleware. openid-client's default authorization
 * code grant request (which next-auth would use out of the box) sends
 * `application/x-www-form-urlencoded`; against this API that arrives as an
 * empty `req.body`, `grant_type` comes back `undefined`, and the exchange
 * fails. That's why the code exchange is hand-rolled below as a plain JSON
 * POST instead of letting next-auth/openid-client do it automatically —
 * PKCE/state generation and verification are still fully delegated to
 * next-auth (`checks: ['pkce', 'state']` below); only the wire format of the
 * token request itself is customized.
 *
 * Field names below (access_token/refresh_token/token_type/expires_in) are
 * confirmed against buildTokenResponse() in wpa/auth-api's
 * src/modules/oauth/oauth.service.ts — snake_case, expires_in as an integer
 * number of seconds (not a duration string like bpa/api's own tokens).
 */
async function exchangeCentralAuthCode(
  code: string,
  redirectUri: string,
  codeVerifier: string | undefined,
): Promise<Record<string, unknown>> {
  const res = await fetch(CENTRAL_AUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env['CENTRAL_AUTH_CLIENT_ID'],
      client_secret: process.env['CENTRAL_AUTH_CLIENT_SECRET'],
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  const json = await res.json()

  if (!res.ok || !json.access_token) {
    // Never forward backend error detail to the browser — the callback
    // handler in next-auth/core turns any thrown error here into a generic
    // `?error=OAuthCallback` redirect to the sign-in page.
    throw new Error('Central Auth token exchange failed.')
  }

  return json
}

function expiryFromSeconds(expiresIn: unknown): number {
  const seconds = Number(expiresIn)
  if (Number.isFinite(seconds) && seconds > 0) return Date.now() + seconds * 1000
  return Date.now()
}

async function refreshCentralAuthToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(CENTRAL_AUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: process.env['CENTRAL_AUTH_CLIENT_ID'],
        client_secret: process.env['CENTRAL_AUTH_CLIENT_SECRET'],
        refresh_token: token.refreshToken,
      }),
    })

    const json = await res.json()

    if (!res.ok || !json.access_token) {
      return { ...token, error: 'RefreshTokenExpired' }
    }

    return {
      ...token,
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? token.refreshToken,
      accessTokenExpires: expiryFromSeconds(json.expires_in),
      error: undefined,
    }
  } catch {
    return { ...token, error: 'RefreshTokenExpired' }
  }
}

/** POST /oauth/revoke, best-effort. Called from events.signOut below. */
async function revokeCentralAuthToken(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return
  try {
    await fetch(CENTRAL_AUTH_REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: refreshToken,
        client_id: process.env['CENTRAL_AUTH_CLIENT_ID'],
        client_secret: process.env['CENTRAL_AUTH_CLIENT_SECRET'],
      }),
    })
  } catch {
    // Don't block sign-out if Central Auth happens to be unreachable —
    // the local NextAuth session cookie is cleared regardless.
  }
}

const centralAuthProvider: OAuthConfig<CentralAuthProfile> = {
  id: 'central-auth',
  name: 'WPA Central Auth',
  type: 'oauth',
  // Deliberately NOT set via the `openid` autodetection next-auth normally
  // does (parseProviders sets `idToken: true` whenever the requested scope
  // contains "openid", which would make next-auth read the profile off a
  // decoded id_token instead of calling /oauth/userinfo). Forcing this to
  // `false` keeps profile data coming from the real userinfo endpoint,
  // matching the integration contract given for this provider.
  idToken: false,
  authorization: {
    url: CENTRAL_AUTH_AUTHORIZATION_URL,
    params: { scope: 'openid', response_type: 'code' },
  },
  token: {
    url: CENTRAL_AUTH_TOKEN_URL,
    async request({ provider, params, checks }) {
      if (!params.code) {
        throw new Error('Central Auth callback did not include an authorization code.')
      }
      const json = await exchangeCentralAuthCode(params.code, provider.callbackUrl, checks.code_verifier)
      return { tokens: json as unknown as TokenSet }
    },
  },
  userinfo: CENTRAL_AUTH_USERINFO_URL,
  checks: ['pkce', 'state'],
  clientId: process.env['CENTRAL_AUTH_CLIENT_ID'],
  clientSecret: process.env['CENTRAL_AUTH_CLIENT_SECRET'],
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || profile.preferred_username || profile.email || 'WPA Central Auth User',
      email: profile.email ?? '',
      roles: Array.isArray(profile.roles) ? profile.roles : [],
    }
  },
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

    // Global Super Admin SSO. Purely additive: local email/password sign-in
    // above is untouched and remains the required fallback. See the
    // "WPA Central Auth" comment block above for the endpoint layout and why
    // the token exchange is hand-rolled.
    centralAuthProvider,
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
    async jwt({ token, user, account }) {
      if (account?.provider === 'central-auth') {
        // Keep this MINIMAL — same constraint as the local-login branch
        // below: only the access/refresh token strings, an expiry
        // timestamp, and a short provider marker. No permissions array, no
        // large claims object (see the 4KB-cookie / Nginx 502 incident
        // noted above the local branch).
        return {
          ...token,
          authProvider: 'central-auth',
          accessToken: account.access_token ?? '',
          refreshToken: account.refresh_token ?? '',
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : expiryFromSeconds(undefined),
          user: {
            id: user?.id ?? token.user?.id ?? '',
            name: user?.name ?? token.user?.name ?? '',
            email: user?.email ?? token.user?.email ?? '',
            roles: user?.roles ?? token.user?.roles ?? [],
          },
          error: undefined,
        }
      }

      if (account?.provider === 'credentials' && user) {
        return {
          ...token,
          authProvider: 'local',
          accessToken: user.accessToken ?? '',
          refreshToken: user.refreshToken ?? '',
          accessTokenExpires: user.accessTokenExpires ?? Date.now(),
          user: {
            id: user.id,
            name: user.name ?? '',
            email: user.email ?? '',
            roles: user.roles,
          },
          error: undefined,
        }
      }

      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token
      }

      return token.authProvider === 'central-auth' ? refreshCentralAuthToken(token) : refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      session.user = token.user
      session.authProvider = token.authProvider
      return session
    },
  },

  events: {
    // Revoke the Central Auth refresh token server-side before the
    // NextAuth session cookie is cleared. Local-login sessions have nothing
    // to revoke on this side (bpa/api has no equivalent revoke endpoint),
    // so this is a no-op for them.
    async signOut({ token }) {
      if (token?.authProvider === 'central-auth') {
        await revokeCentralAuthToken(token.refreshToken)
      }
    },
  },
}
