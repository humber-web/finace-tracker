import { revokeSession } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (user?.sessionId) {
    await revokeSession(user.sessionId)
  }

  // Clear cookies
  deleteCookie(event, 'auth_token')
  deleteCookie(event, 'refresh_token')

  return { success: true }
})
