import { categories } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category ID'
    })
  }

  // Check ownership and prevent editing system categories
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

  // System categories can only be edited by admins
  if (existing.isSystem && !user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot edit system categories'
    })
  }

  // User categories: verify ownership
  if (!existing.isSystem && existing.userId !== user.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  const updated = await db
    .update(categories)
    .set({
      name: body.name || existing.name,
      color: body.color || existing.color,
      icon: body.icon !== undefined ? body.icon : existing.icon
    })
    .where(eq(categories.id, id))
    .returning()

  return updated[0]
})
