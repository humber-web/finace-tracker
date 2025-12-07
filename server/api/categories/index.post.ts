import { categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  if (!body.name || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and type are required'
    })
  }

  const result = await db.insert(categories).values({
    userId: user.userId, // Set owner
    isSystem: false, // User categories are not system categories
    name: body.name,
    type: body.type,
    color: body.color || 'gray',
    icon: body.icon
  }).returning()

  return result[0]
})
