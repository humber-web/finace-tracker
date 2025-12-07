import { verifyToken } from '../utils/jwt'
import { users } from '../database/schema'
import { eq } from 'drizzle-orm'
import { db } from '../utils/db'

/**
 * Global authentication middleware
 * Runs on ALL API requests, extracts user from JWT if present
 */
export default defineEventHandler(async (event) => {
  // Skip auth for public endpoints
  const path = event.path || ''

  if (
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/callback') ||
    path.startsWith('/_nuxt') ||
    path.startsWith('/api/_') || // Internal Nuxt APIs
    path === '/' ||
    path.startsWith('/__') // Nuxt dev tools
  ) {
    return
  }

  // Get token from cookie
  const token = getCookie(event, 'auth_token')

  if (!token) {
    // No token - user not authenticated
    event.context.user = null
    event.context.userRecord = null
    return
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    // Invalid token - clear cookie
    deleteCookie(event, 'auth_token')
    event.context.user = null
    event.context.userRecord = null
    return
  }

  // Fetch full user record
  const [userRecord] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1)

  if (!userRecord) {
    // User no longer exists
    deleteCookie(event, 'auth_token')
    event.context.user = null
    event.context.userRecord = null
    return
  }

  // Attach user to context
  event.context.user = payload
  event.context.userRecord = userRecord
})
