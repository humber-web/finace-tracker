import { categories } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category ID'
    })
  }

  // Check category exists and ownership
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found'
    })
  }

  // Cannot delete system categories
  if (existing.isSystem) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot delete system categories'
    })
  }

  // Verify ownership
  if (existing.userId !== user.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  await db.delete(categories).where(eq(categories.id, id))

  return { success: true }
})
