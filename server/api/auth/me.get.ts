export default defineEventHandler(async (event) => {
  const user = event.context.user
  const userRecord = event.context.userRecord

  if (!user || !userRecord) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  return {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    avatar: userRecord.avatar,
    isAdmin: userRecord.isAdmin ? true : false
  }
})
