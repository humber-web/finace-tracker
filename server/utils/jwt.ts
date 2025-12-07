import jwt from 'jsonwebtoken'
import { sessions } from '../database/schema'
import { eq, and, gte } from 'drizzle-orm'
import { db } from './db'
import crypto from 'crypto'

export interface JWTPayload {
  userId: number
  email: string
  isAdmin: boolean
  sessionId?: number
  iat?: number
  exp?: number
}

/**
 * Generate JWT access token and refresh token
 */
export async function generateTokens(userId: number, email: string, isAdmin: boolean) {
  const config = useRuntimeConfig()

  const accessToken = jwt.sign(
    { userId, email, isAdmin, type: 'access' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  )

  // Hash token for storage (for revocation capability)
  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')

  // Store session in database
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  const [session] = await db.insert(sessions).values({
    userId,
    token: tokenHash,
    expiresAt,
    createdAt: new Date(),
    lastAccessedAt: new Date()
  }).returning()

  return {
    accessToken,
    refreshToken,
    sessionId: session.id,
    expiresIn: config.jwtExpiresIn
  }
}

/**
 * Verify JWT token and check session validity
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  const config = useRuntimeConfig()

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload

    // Check if session still valid
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, decoded.userId),
          eq(sessions.token, tokenHash),
          gte(sessions.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!session) {
      return null // Session revoked or expired
    }

    // Update last accessed time
    await db
      .update(sessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(sessions.id, session.id))

    decoded.sessionId = session.id
    return decoded

  } catch (error) {
    return null
  }
}

/**
 * Revoke session (logout)
 */
export async function revokeSession(sessionId: number) {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

/**
 * Revoke all user sessions (logout everywhere)
 */
export async function revokeAllUserSessions(userId: number) {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions() {
  const now = new Date()
  await db.delete(sessions).where(gte(now, sessions.expiresAt))
}
