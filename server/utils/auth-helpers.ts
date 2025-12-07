import type { H3Event } from 'h3'
import type { JWTPayload } from './jwt'

/**
 * Get authenticated user or throw 401
 */
export function requireAuth(event: H3Event): JWTPayload {
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return user
}

/**
 * Require admin role
 */
export function requireAdmin(event: H3Event): JWTPayload {
  const user = requireAuth(event)

  if (!user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return user
}

/**
 * Check if user owns a resource
 */
export function requireOwnership(event: H3Event, resourceUserId: number): JWTPayload {
  const user = requireAuth(event)

  // Admins can access all resources
  if (user.isAdmin) {
    return user
  }

  // Check ownership
  if (user.userId !== resourceUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  return user
}
