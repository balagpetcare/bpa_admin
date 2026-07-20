import 'next-auth'
import { BpaUser } from './bpa.types'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    error?: 'RefreshTokenExpired'
    user: BpaUser
    /** Which provider issued the tokens backing this session. */
    authProvider?: 'local' | 'central-auth'
  }

  interface User extends BpaUser {
    // Optional: the local CredentialsProvider's authorize() always sets
    // these, but the "central-auth" OAuthConfig's profile() does not — for
    // that provider the tokens arrive separately via the `account` param in
    // the jwt() callback, not on `user`.
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    error?: 'RefreshTokenExpired'
    user: BpaUser
    /** Which provider issued the tokens currently stored on this JWT. */
    authProvider?: 'local' | 'central-auth'
  }
}
