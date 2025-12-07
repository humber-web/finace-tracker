import { categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'
import { or, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  // Return system categories + user's custom categories
  return await db
    .select()
    .from(categories)
    .where(
      or(
        eq(categories.isSystem, true), // System categories (available to all)
        eq(categories.userId, user.userId) // User's custom categories
      )
    )
})
