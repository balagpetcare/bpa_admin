import 'next-auth'
import { BpaUser } from './bpa.types'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    error?: 'RefreshTokenExpired'
    user: BpaUser
  }

  interface User extends BpaUser {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    error?: 'RefreshTokenExpired'
    user: BpaUser
  }
}
