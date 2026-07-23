import type { NextAuthOptions } from 'next-auth'
import type { OAuthConfig } from 'next-auth/providers/oauth'
import type { TokenSet } from 'openid-client'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { randomBytes, createHash } from 'crypto'

// ─── WPA Central Auth (Global Super Admin SSO) ──────────────────────────────
//
// Central Auth's public OAuth surface is split across two hosts/paths:
//  - the *browser-facing* authorization page (a real login UI, not JSON):
//    {CENTRAL_AUTH_WEB_BASE}/oauth/authorize
//  - the *server-to-server* API, under /api/v1/oauth/*, used for the token
//    exchange, refresh, userinfo lookup and revoke.
// Defaults to the production identity service, but overridable via env so
// local dev can point at a locally running wpa_auth_web/wpa_auth_api.
const CENTRAL_AUTH_WEB_BASE = process.env['CENTRAL_AUTH_WEB_URL'] || 'https://auth.worldpetsassociation.com'
const CENTRAL_AUTH_API_BASE = process.env['CENTRAL_AUTH_API_URL'] || `${CENTRAL_AUTH_WEB_BASE}/api/v1`
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
async function exchangeCentralAuthCode(code: string, redirectUri: string, codeVerifier: string | undefined): Promise<Record<string, unknown>> {
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

const CENTRAL_AUTH_LOGIN_URL = `${CENTRAL_AUTH_API_BASE}/auth/login`
const CENTRAL_AUTH_AUTHORIZE_API_URL = `${CENTRAL_AUTH_API_BASE}/oauth/authorize`

function base64url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Inline email/password sign-in. This does NOT re-implement credential
 * checking in bpa_admin — it relays the credentials, server-side only, to
 * Central Auth's own `/auth/login`, then drives the *same* OAuth
 * authorization-code + PKCE exchange the "Continue with Central
 * Authentication" button uses, just without a browser redirect through the
 * hosted login page:
 *
 *   1. POST /auth/login {emailOrUsername, password, clientId} — Central Auth
 *      verifies the password and returns a short-lived bearer accessToken.
 *      This token is used for exactly one request (step 2, below) and is
 *      never persisted or returned to the browser.
 *   2. GET /oauth/authorize?...&code_challenge=...  with
 *      `Authorization: Bearer <accessToken from step 1>` — for a
 *      FIRST_PARTY_APP client (bpa-admin is registered as one) this
 *      returns `{ code, state }` directly as JSON (see oauth.service.ts's
 *      startAuthorization: first-party clients skip the consent screen).
 *   3. POST /oauth/token — exchange that code the normal way (identical to
 *      exchangeCentralAuthCode below), yielding the real client-bound
 *      access/refresh tokens this app actually uses going forward.
 *
 * The end result is indistinguishable from a normal OAuth code-flow
 * session: same client_id/redirect_uri/PKCE binding, same token shape. The
 * password itself only ever travels browser -> this Next.js server ->
 * Central Auth's API, is never logged, and is discarded once step 1
 * returns.
 */
async function loginWithCentralAuthPassword(emailOrUsername: string, password: string) {
  // Deliberately omit `clientId` here (unlike the comment above once
  // suggested) — passing this app's client_id makes Central Auth sign the
  // step-1 access token's audience as this client's own admin audience
  // (e.g. "bpa-admin") for Global Super Admin principals, which excludes
  // the default "bpa-mobile" audience and gets rejected by every OTHER
  // endpoint's audience check, including the very next /oauth/authorize
  // call below. wpa_auth_web's own hosted login never passes a downstream
  // clientId to /auth/login either — this mirrors that working pattern.
  const loginRes = await fetch(CENTRAL_AUTH_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrUsername,
      password,
    }),
  })
  const loginJson = await loginRes.json()
  if (!loginRes.ok || !loginJson.accessToken) {
    throw new Error('Invalid email or password.')
  }

  const codeVerifier = base64url(randomBytes(32))
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest())
  const state = base64url(randomBytes(24))
  const redirectUri = `${process.env['ADMIN_PANEL_URL'] || process.env['NEXTAUTH_URL'] || 'http://localhost:3001'}/api/auth/callback/central-auth`

  const authorizeUrl = new URL(CENTRAL_AUTH_AUTHORIZE_API_URL)
  authorizeUrl.searchParams.set('client_id', process.env['CENTRAL_AUTH_CLIENT_ID'] ?? '')
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('scope', 'openid')
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')

  const authorizeRes = await fetch(authorizeUrl, {
    headers: { Authorization: `Bearer ${loginJson.accessToken}` },
  })
  const authorizeJson = await authorizeRes.json()
  if (!authorizeRes.ok || authorizeJson.requiresConsent || !authorizeJson.code) {
    // Never surface backend detail — this is an unexpected server-side
    // condition, not a credential problem (those already threw above).
    throw new Error('Central Auth sign-in could not be completed.')
  }

  const tokenJson = await exchangeCentralAuthCode(authorizeJson.code, redirectUri, codeVerifier)

  const userinfoRes = await fetch(CENTRAL_AUTH_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  })
  const profile: CentralAuthProfile = await userinfoRes.json()
  if (!userinfoRes.ok || !profile.sub) {
    throw new Error('Central Auth sign-in could not be completed.')
  }

  return { tokenJson, profile }
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
    // Global Super Admin SSO — the only credential entry point for this
    // admin panel. See the "WPA Central Auth" comment block above for the
    // endpoint layout and why the token exchange is hand-rolled.
    centralAuthProvider,

    // Inline email/password form on this app's own sign-in page. Credential
    // verification still happens entirely inside Central Auth (see
    // loginWithCentralAuthPassword above) — this provider only relays the
    // request and completes the same OAuth code+PKCE exchange server-side.
    CredentialsProvider({
      id: 'central-auth-password',
      name: 'Central Authentication',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const { tokenJson, profile } = await loginWithCentralAuthPassword(credentials.email, credentials.password)

        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username || profile.email || 'WPA Central Auth User',
          email: profile.email ?? '',
          roles: Array.isArray(profile.roles) ? profile.roles : [],
          accessToken: tokenJson.access_token as string,
          refreshToken: tokenJson.refresh_token as string,
          accessTokenExpires: expiryFromSeconds(tokenJson.expires_in),
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

      if (account?.provider === 'central-auth-password' && user) {
        return {
          ...token,
          authProvider: 'central-auth',
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

      return refreshCentralAuthToken(token)
    },

    async session({ session, token }) {
      // Bearer tokens remain inside the encrypted HttpOnly NextAuth cookie.
      // Browser API calls use /api/backend; never serialize them to session JSON.
      session.error = token.error
      session.user = token.user
      session.authProvider = token.authProvider
      return session
    },
  },

  events: {
    // Revoke the Central Auth refresh token server-side before the
    // NextAuth session cookie is cleared.
    async signOut({ token }) {
      await revokeCentralAuthToken(token?.refreshToken)
    },
  },
}
