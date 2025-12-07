import type { JWTPayload } from '../utils/jwt'

declare module 'h3' {
  interface H3EventContext {
    user: JWTPayload | null
    userRecord: {
      id: number
      email: string
      name: string | null
      avatar: string | null
      emailVerified: boolean
      isAdmin: boolean
      createdAt: Date
      lastLoginAt: Date | null
    } | null
  }
}

export {}
